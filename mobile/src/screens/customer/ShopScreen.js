import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { Button, Chip, Searchbar, Text } from "react-native-paper";
import ProductCard from "../../components/ProductCard";
import Screen from "../../components/Screen";
import { EmptyView, ErrorBanner, LoadingView } from "../../components/StateViews";
import { ProductsApi } from "../../services/api";
import { useCart } from "../../state/CartContext";
import { normalizeProduct } from "../../utils/format";
import { spacing } from "../../theme/theme";

const categories = ["all", "split", "window", "floor"];

export default function ShopScreen({ navigation }) {
  const { addToCart, count, syncCartStock } = useCart();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setRefreshing(true);
    try {
      const result = await ProductsApi.public();
      const mapped = (result.products || []).map(normalizeProduct);
      setProducts(mapped);
      syncCartStock(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [syncCartStock]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesQuery = !needle || [item.name, item.brand, item.sku, item.specs].join(" ").toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [products, query, category]);

  if (loading) return <LoadingView label="Loading products..." />;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <View style={styles.header}>
        <Text variant="headlineSmall">Customer POS</Text>
        <Button icon="cart" mode="contained-tonal" onPress={() => navigation.navigate("Cart")}>{count}</Button>
      </View>
      <ErrorBanner message={error} />
      <Searchbar placeholder="Search products, brands, SKU" value={query} onChangeText={setQuery} />
      <View style={styles.chips}>
        {categories.map((item) => <Chip key={item} selected={category === item} onPress={() => setCategory(item)}>{item}</Chip>)}
      </View>
      {filtered.length === 0 ? <EmptyView title="No products found" message="Try a different category or search term." /> : null}
      {filtered.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onPress={() => navigation.navigate("ProductDetails", { product })}
          onAdd={() => addToCart(product)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }
});
