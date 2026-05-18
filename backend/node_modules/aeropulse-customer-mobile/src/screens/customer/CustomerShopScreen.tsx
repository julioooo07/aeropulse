import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, EmptyState, Input, Screen, SectionTitle } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { listPublicProducts } from "@/services/catalogService";
import type { Product } from "@/types/domain";
import { colors } from "@/theme/tokens";

export default function CustomerShopScreen() {
  const router = useRouter();
  const { addItem, totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    listPublicProducts().then((res) => setProducts(res.products || [])).catch(() => setProducts([]));
  }, []);

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(products.map((item) => item.category).filter(Boolean) as string[]))];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const text = `${item.name} ${item.brand || ""} ${item.specs || ""}`.toLowerCase();
      return matchesCategory && text.includes(search.toLowerCase());
    });
  }, [products, search, selectedCategory]);

  return (
    <Screen>
      <SectionTitle title="Shop" subtitle="Browse the same public product catalog as the web storefront." />

      <Card style={{ gap: 10 }}>
        <Input value={search} onChangeText={setSearch} placeholder="Search products" autoCapitalize="none" />
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => setSelectedCategory(item)} style={[styles.filterPill, selectedCategory === item && styles.filterPillActive]}>
              <Text style={[styles.filterText, selectedCategory === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          )}
        />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No products found" subtitle="Try another search term or category." />
      ) : (
        <FlatList
          data={filtered}
          scrollEnabled={false}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Card style={{ gap: 12 }}>
              <View style={styles.row}>
                {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.thumb} /> : null}
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.meta}>{item.brand} · {item.specs}</Text>
                  <Text style={styles.price}>PHP {Number(item.price || 0).toLocaleString()}</Text>
                </View>
              </View>
              <Button title="Add to cart" onPress={() => addItem(item)} />
            </Card>
          )}
        />
      )}

      <Button title={`Open cart (${totalItems})`} variant="secondary" onPress={() => router.push("/customer/cart")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  thumb: { width: 72, height: 72, borderRadius: 16, backgroundColor: colors.surfaceMuted },
  title: { color: colors.text, fontSize: 16, fontWeight: "800" },
  meta: { color: colors.textMuted, fontSize: 12 },
  price: { color: colors.accent, fontWeight: "800", fontSize: 14 },
  filterPill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.surfaceMuted },
  filterPillActive: { backgroundColor: colors.primary },
  filterText: { color: colors.text, fontWeight: "700", fontSize: 12, textTransform: "capitalize" },
  filterTextActive: { color: "#fff" },
});
