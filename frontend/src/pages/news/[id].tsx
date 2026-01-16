import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, Tag, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  region: string;
  published_at: string;
  raw_content: string;
  filtered_content: string;
  summary: string;
  category: string;
  is_verified: boolean;
  metadata: any;
}

export default function ArticlePage() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/news/${id}`);
      setArticle(response.data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Artikkel ikke funnet</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            ← Tilbake til forsiden
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} - Tet</title>
        <meta name="description" content={article.summary} />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbake til nyheter
          </Link>

          {/* Article */}
          <article className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <header className="mb-6">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium">
                  {article.region}
                </span>
                {article.category && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm">
                    {article.category}
                  </span>
                )}
                {article.is_verified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Verifisert
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {article.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">{article.source}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(article.published_at), 'dd. MMMM yyyy, HH:mm', { locale: nb })}
                </span>
              </div>
            </header>

            {/* Summary */}
            <div className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-l-4 border-primary-600">
              <h2 className="text-sm font-semibold text-primary-900 dark:text-primary-300 mb-2">
                SAMMENDRAG
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {article.summary}
              </p>
            </div>

            {/* Filtered Content (Facts Only) */}
            {article.filtered_content && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Fakta (filtrert innhold)
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {article.filtered_content}
                  </p>
                </div>
              </div>
            )}

            {/* Original Source Link */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                Les originalsartikkel på {article.source}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
