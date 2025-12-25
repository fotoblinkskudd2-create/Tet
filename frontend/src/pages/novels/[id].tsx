import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Chapter {
  number: number;
  title: string;
  content: string;
}

interface Novel {
  id: string;
  userId: string;
  title: string;
  genre: string;
  tone: string;
  chapters: Chapter[];
  status: 'generating' | 'completed' | 'failed';
  totalChapters: number;
  currentChapter: number;
  createdAt: string;
  updatedAt: string;
}

export default function NovelViewerPage() {
  const router = useRouter();
  const { id } = router.query;
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNovel();
      const interval = setInterval(() => {
        if (novel?.status === 'generating') {
          fetchNovel();
        }
      }, 5000); // Poll every 5 seconds while generating

      return () => clearInterval(interval);
    }
  }, [id, novel?.status]);

  const fetchNovel = async () => {
    try {
      const response = await fetch(`/api/novels/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNovel(data);
      }
    } catch (error) {
      console.error('Feil ved henting av roman:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadMarkdown = () => {
    if (!novel) return;

    let markdown = `# ${novel.title}\n\n`;
    markdown += `**Sjanger:** ${novel.genre}  \n`;
    markdown += `**Tone:** ${novel.tone}\n\n`;
    markdown += `---\n\n`;

    novel.chapters.forEach(chapter => {
      markdown += `## Kapittel ${chapter.number}: ${chapter.title}\n\n`;
      markdown += `${chapter.content}\n\n`;
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${novel.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!novel) return;

    // Dynamic import to reduce initial bundle size
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Title page
    doc.setFontSize(24);
    doc.text(novel.title, 105, 50, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Sjanger: ${novel.genre}`, 105, 70, { align: 'center' });
    doc.text(`Tone: ${novel.tone}`, 105, 80, { align: 'center' });

    // Chapters
    novel.chapters.forEach((chapter, idx) => {
      doc.addPage();
      doc.setFontSize(18);
      doc.text(`Kapittel ${chapter.number}: ${chapter.title}`, 20, 20);
      doc.setFontSize(12);

      // Split content into lines
      const lines = doc.splitTextToSize(chapter.content, 170);
      let y = 35;

      lines.forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 7;
      });
    });

    doc.save(`${novel.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  };

  const nextPage = () => {
    if (!novel || currentPage >= novel.chapters.length) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(currentPage + 1);
      setIsFlipping(false);
    }, 600);
  };

  const prevPage = () => {
    if (currentPage <= 0) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(currentPage - 1);
      setIsFlipping(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="viewer-page">
        <div className="loader">
          <p>Laster roman...</p>
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="viewer-page">
        <p>Roman ikke funnet</p>
        <Link href="/novels">Tilbake til mine romaner</Link>
      </div>
    );
  }

  const isGenerating = novel.status === 'generating';
  const currentChapter = novel.chapters[currentPage];
  const isCoverPage = currentPage === 0;

  return (
    <div className="viewer-page">
      <div className="viewer-header">
        <Link href="/novels" className="back-link">
          ← Tilbake
        </Link>
        {novel.status === 'completed' && (
          <div className="download-buttons">
            <button onClick={downloadMarkdown} className="btn-download">
              📝 Last ned Markdown
            </button>
            <button onClick={downloadPDF} className="btn-download">
              📄 Last ned PDF
            </button>
          </div>
        )}
      </div>

      {isGenerating && (
        <div className="generation-status">
          <p>
            🔮 Genererer kapittel {novel.currentChapter} av {novel.totalChapters}...
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(novel.currentChapter / novel.totalChapters) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="book-container">
        <div className={`book ${isFlipping ? 'flipping' : ''}`}>
          <div className="page">
            <div className="page-content">
              {isCoverPage ? (
                <div className="cover">
                  <h1 className="book-title">{novel.title}</h1>
                  <div className="book-meta">
                    <p className="genre">{novel.genre}</p>
                    <p className="tone">{novel.tone}</p>
                  </div>
                  {novel.status === 'completed' && (
                    <p className="page-count">
                      {novel.chapters.length} kapitler
                    </p>
                  )}
                </div>
              ) : currentChapter ? (
                <div className="chapter">
                  <h2 className="chapter-title">
                    Kapittel {currentChapter.number}: {currentChapter.title}
                  </h2>
                  <div className="chapter-content">
                    {currentChapter.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="page-number">
              {isCoverPage ? '' : currentPage}
            </div>
          </div>
        </div>

        <div className="navigation">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="nav-btn"
          >
            ← Forrige
          </button>
          <span className="page-indicator">
            Side {currentPage} av {novel.chapters.length}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage >= novel.chapters.length}
            className="nav-btn"
          >
            Neste →
          </button>
        </div>
      </div>
    </div>
  );
}
