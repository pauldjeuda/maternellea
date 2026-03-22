/**
 * features/advice/types/index.ts
 *
 * Types locaux au module Conseils.
 * Les types domaine (Article, ArticleCategory) restent dans @types/models.
 * Ces types couvrent la configuration UI et l'état du module.
 */

import type { ArticleCategory } from '@types/models';
import { tokens } from '@theme/tokens';

const { colors, palette } = tokens;

// ─────────────────────────────────────────────────────────────
//  CATEGORY CONFIG  (couleur, emoji, label)
// ─────────────────────────────────────────────────────────────

export interface CategoryConfig {
  key:       ArticleCategory;
  label:     string;
  emoji:     string;
  color:     string;   // text / accent color
  bgColor:   string;   // chip / card background
  gradient:  [string, string];  // for hero banners
}

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    key:      'cycle',
    label:    'Cycle',
    emoji:    '🌙',
    color:    colors.phaseCycle,
    bgColor:  colors.primaryLight,
    gradient: [palette.rose100, palette.rose50],
  },
  {
    key:      'pregnancy',
    label:    'Grossesse',
    emoji:    '🤰',
    color:    colors.phasePregnancy,
    bgColor:  colors.secondaryLight,
    gradient: [palette.mauve100, palette.mauve50],
  },
  {
    key:      'postpartum',
    label:    'Post-partum',
    emoji:    '🍼',
    color:    colors.phasePostpartum,
    bgColor:  colors.accentLight,
    gradient: [palette.peach100, palette.peach50],
  },
  {
    key:      'baby',
    label:    'Bébé',
    emoji:    '👶',
    color:    '#E97B15',
    bgColor:  '#FEF3C7',
    gradient: ['#FDE68A', '#FEF3C7'],
  },
  {
    key:      'nutrition',
    label:    'Nutrition',
    emoji:    '🥗',
    color:    colors.fertile,
    bgColor:  colors.fertileLight,
    gradient: [palette.sage100, palette.sage50],
  },
  {
    key:      'wellbeing',
    label:    'Bien-être',
    emoji:    '🌿',
    color:    '#0284C7',
    bgColor:  '#DBEAFE',
    gradient: ['#BFDBFE', '#DBEAFE'],
  },
  {
    key:      'mental_health',
    label:    'Santé mentale',
    emoji:    '💭',
    color:    '#7C3AED',
    bgColor:  '#EDE9FE',
    gradient: ['#DDD6FE', '#EDE9FE'],
  },
];

export const getCategoryConfig = (key: ArticleCategory): CategoryConfig =>
  CATEGORY_CONFIGS.find(c => c.key === key) ?? CATEGORY_CONFIGS[0]!;

// ─────────────────────────────────────────────────────────────
//  ENRICHED ARTICLE  (Article + display metadata)
// ─────────────────────────────────────────────────────────────

export interface EnrichedArticle {
  id:               string;
  title:            string;
  summary:          string;
  content:          string;
  category:         ArticleCategory;
  categoryConfig:   CategoryConfig;
  readTimeMinutes:  number;
  author?:          string;
  isFavorite:       boolean;
  isBookmarked:     boolean;
  publishedAt:      string;
  tags:             string[];
  relatedArticleIds?: string[];
  featured?:        boolean;
}

// ─────────────────────────────────────────────────────────────
//  FILTER / SEARCH STATE
// ─────────────────────────────────────────────────────────────

export type ArticleFilter = ArticleCategory | 'all' | 'favorites';

export interface AdviceState {
  activeFilter:    ArticleFilter;
  searchQuery:     string;
  favorites:       Set<string>;   // article IDs marked as favorite
  readArticles:    Set<string>;   // article IDs that have been opened
}

// ─────────────────────────────────────────────────────────────
//  CONTENT BLOCK  (for structured article rendering)
// ─────────────────────────────────────────────────────────────

export type ContentBlockType =
  | 'heading'     // ## Heading
  | 'subheading'  // ### Subheading
  | 'paragraph'
  | 'bullet_list'
  | 'bold_paragraph'  // **text**
  | 'tip'         // custom callout
  | 'warning';    // custom callout

export interface ContentBlock {
  type:    ContentBlockType;
  text?:   string;
  items?:  string[];   // for bullet_list
}

/**
 * Parse simple markdown-like content into structured blocks.
 * Supports: ## heading, ### subheading, **bold** paragraphs, - lists
 */
export function parseContent(raw: string): ContentBlock[] {
  const lines  = raw.split('\n');
  const blocks: ContentBlock[] = [];
  let   currentList: string[] = [];

  function flushList() {
    if (currentList.length > 0) {
      blocks.push({ type: 'bullet_list', items: [...currentList] });
      currentList = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { flushList(); continue; }

    if (trimmed.startsWith('### ')) {
      flushList();
      blocks.push({ type: 'subheading', text: trimmed.slice(4) });
    } else if (trimmed.startsWith('## ')) {
      flushList();
      blocks.push({ type: 'heading', text: trimmed.slice(3) });
    } else if (trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2));
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      flushList();
      blocks.push({ type: 'bold_paragraph', text: trimmed.slice(2, -2) });
    } else {
      flushList();
      // Inline bold: remove ** markers for display
      const cleaned = trimmed.replace(/\*\*([^*]+)\*\*/g, '$1');
      blocks.push({ type: 'paragraph', text: cleaned });
    }
  }
  flushList();
  return blocks;
}
