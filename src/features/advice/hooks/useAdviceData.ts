/**
 * features/advice/hooks/useAdviceData.ts
 *
 * Single hook consumed by all advice screens.
 * Merges static article data with user store state (favorites, read).
 * Future API integration: replace ALL_ARTICLES with a fetch call here.
 */

import { useMemo } from 'react';
import { useAuthStore, selectActivePhase } from '@store/authStore';
import {
  useAdviceStore,
  selectFavorites, selectReadHistory, selectAdviceActions,
} from '../store/adviceStore';
import { ALL_ARTICLES, FEATURED_ARTICLES } from '../services/articleMocks';
import { getCategoryConfig } from '../types';
import type { EnrichedArticle, ArticleFilter } from '../types';
import type { ArticleCategory } from '@types/models';

// ─────────────────────────────────────────────────────────────
//  ENRICH  — merge static + store state
// ─────────────────────────────────────────────────────────────

function enrich(article: typeof ALL_ARTICLES[0], favorites: string[]): EnrichedArticle {
  return {
    ...article,
    categoryConfig: getCategoryConfig(article.category),
    isFavorite:     favorites.includes(article.id),
    isBookmarked:   favorites.includes(article.id),
  };
}

// ─────────────────────────────────────────────────────────────
//  HOOK
// ─────────────────────────────────────────────────────────────

export function useAdviceData() {
  const activePhase = useAuthStore(selectActivePhase);
  const favorites   = useAdviceStore(selectFavorites);
  const readHistory = useAdviceStore(selectReadHistory);
  const actions     = useAdviceStore(selectAdviceActions);

  // All articles enriched with store state
  const allArticles = useMemo(
    () => ALL_ARTICLES.map(a => enrich(a, favorites)),
    [favorites],
  );

  // Featured articles (home banner)
  const featured = useMemo(
    () => FEATURED_ARTICLES.map(a => enrich(a, favorites)),
    [favorites],
  );

  // Phase-relevant articles (for "Pour vous" section)
  const phaseArticles = useMemo(() => {
    const phaseCategory: ArticleCategory =
      activePhase === 'pregnancy'  ? 'pregnancy'  :
      activePhase === 'postpartum' ? 'postpartum' : 'cycle';
    return allArticles
      .filter(a => a.category === phaseCategory || a.category === 'nutrition' || a.category === 'wellbeing')
      .slice(0, 6);
  }, [allArticles, activePhase]);

  // Favorite articles
  const favoriteArticles = useMemo(
    () => allArticles.filter(a => a.isFavorite),
    [allArticles],
  );

  // ── Accessors ────────────────────────────────────────────────

  function getById(id: string): EnrichedArticle | undefined {
    const raw = ALL_ARTICLES.find(a => a.id === id);
    return raw ? enrich(raw, favorites) : undefined;
  }

  function getByCategory(category: ArticleCategory): EnrichedArticle[] {
    return allArticles.filter(a => a.category === category);
  }

  function search(query: string): EnrichedArticle[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return allArticles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q)),
    );
  }

  function getRelated(articleId: string, limit = 3): EnrichedArticle[] {
    const article = allArticles.find(a => a.id === articleId);
    if (!article) return [];
    return allArticles
      .filter(a => a.id !== articleId && a.category === article.category)
      .slice(0, limit);
  }

  function filter(f: ArticleFilter): EnrichedArticle[] {
    if (f === 'all')       return allArticles;
    if (f === 'favorites') return favoriteArticles;
    return getByCategory(f as ArticleCategory);
  }

  function isRead(id: string): boolean {
    return readHistory.includes(id);
  }

  return {
    // Data
    allArticles,
    featured,
    phaseArticles,
    favoriteArticles,
    readHistory,
    // Accessors
    getById,
    getByCategory,
    search,
    getRelated,
    filter,
    isRead,
    // Actions
    toggleFavorite: actions.toggleFavorite,
    markRead:       actions.markRead,
  };
}
