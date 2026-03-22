/**
 * features/advice/screens/FavoritesScreen.tsx
 *
 * Liste des articles sauvegardés en favoris.
 * Structure prête : il suffit de changer le store pour persister côté API.
 */

import React from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { useAdviceData } from '../hooks/useAdviceData';
import { ArticleCard, ArticleListEmpty } from '../components/AdviceUI';
import type { AdviceNavProp } from '@types/navigation';

const { colors, spacing, fontSize, fontWeight } = tokens;

export function FavoritesScreen() {
  const navigation = useNavigation<AdviceNavProp>();
  const insets     = useSafeAreaInsets();
  const { favoriteArticles, toggleFavorite, markRead, isRead } = useAdviceData();

  function openArticle(id: string) {
    markRead(id);
    navigation.navigate('AdviceDetail', { articleId: id });
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>Mes favoris</Text>
        <Text style={s.count}>
          {favoriteArticles.length} article{favoriteArticles.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={favoriteArticles}
        keyExtractor={a => a.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => openArticle(item.id)}
            onFavoriteToggle={() => toggleFavorite(item.id)}
            isRead={isRead(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        ListEmptyComponent={() => (
          <ArticleListEmpty
            emoji="❤️"
            title="Aucun favori pour l'instant"
            subtitle="Appuyez sur le cœur d'un article pour le retrouver ici."
          />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[3],
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.5 },
  count: { fontSize: fontSize.sm, color: colors.textTertiary },
  list:  { padding: spacing[5], paddingBottom: spacing[12] },
});
