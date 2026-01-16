import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import Head from 'next/head';
import Link from 'next/link';
import { Newspaper, Globe, Flag, DollarSign, Filter } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  region: 'norway' | 'usa' | 'world';
  published_at: string;
  filtered_content: string;
  summary: string;
  category: string;
  is_verified: boolean;
}

const regionLabels = {
  norway: { label: 'Norge', icon: Flag, color: 'bg-red-500' },
  usa: { label: 'USA', icon: DollarSign, color: 'bg-blue-500' },
  world: { label: 'Verden', icon: Globe, color: 'bg-green-500' },
};

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchArticles();
  }, [selectedRegion, selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedRegion) params.append('region', selectedRegion);
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('limit', '50');

      const response = await axios.get(`${API_URL}/api/news?${params.toString()}`);
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Tet - Nyheter Uten Bullshit</title>
        <meta name="description" content="Få nyheter fra Norge, USA og verden - filtrert for rene fakta" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Newspaper className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tet</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Nyheter uten bullshit - Kun fakta</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filtrer nyheter</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Alle regioner</option>
                  <option value="norway">Norge</option>
                  <option value="usa">USA</option>
                  <option value="world">Verden</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Alle kategorier</option>
                  <option value="politikk">Politikk</option>
                  <option value="økonomi">Økonomi</option>
                  <option value="teknologi">Teknologi</option>
                  <option value="helse">Helse</option>
                  <option value="miljø">Miljø</option>
                  <option value="kriminalitet">Kriminalitet</option>
                  <option value="sport">Sport</option>
                  <option value="kultur">Kultur</option>
                  <option value="internasjonalt">Internasjonalt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Laster nyheter...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {articles.map((article) => {
                const regionInfo = regionLabels[article.region];
                const Icon = regionInfo.icon;

                return (
                  <article
                    key={article.id}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${regionInfo.color} rounded-full p-2 flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {article.source}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {format(new Date(article.published_at), 'dd. MMM yyyy HH:mm', { locale: nb })}
                          </span>
                          {article.category && (
                            <>
                              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                              <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                                {article.category}
                              </span>
                            </>
                          )}
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                          {article.title}
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                          {article.summary}
                        </p>

                        {article.filtered_content && (
                          <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                              {article.filtered_content.substring(0, 300)}
                              {article.filtered_content.length > 300 && '...'}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm"
                          >
                            Les mer på {article.source} →
                          </a>
                          {article.is_verified && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                              ✓ Verifisert
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div className="text-center py-12">
              <Newspaper className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Ingen artikler funnet</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
