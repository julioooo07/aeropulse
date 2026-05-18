import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import CustomerScreen from "../../components/customer/CustomerScreen";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { COLORS, SPACING, FONT } from "../../constants/theme";
import * as api from "../../services/api";
import { useUserContext } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";

export default function CustomerShopScreen() {
  const router = useRouter();
  const { token, current } = useUserContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem, count } = useCart();

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get("/products/public")
      .then((res) => {
        if (!active) return;
        const items = Array.isArray(res.data.products)
          ? res.data.products.map((p) => ({
              ...p,
              inStock: Number(p.stock) > 0,
              imageUrl: p.imageUrl || p.image || "",
            }))
          : [];
        setProducts(items);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const handleAddToCart = (product) => {
    if (!current || !token) {
      Alert.alert("Login required", "Please log in to add items to your cart.");
      return;
    }
    addItem(product, 1);
  };

  return (
    <CustomerScreen title="Shop" subtitle="Browse and buy AC units">
      {loading ? (
        <Text style={{ textAlign: "center", marginTop: SPACING.lg }}>Loading products...</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
          {count > 0 ? (
            <Card style={{ marginBottom: SPACING.md }}>
              <Text style={{ color: COLORS.textSecondary }}>
                {count} item{count === 1 ? "" : "s"} in cart
              </Text>
              <Button
                title="View Cart"
                style={{ marginTop: SPACING.sm }}
                onPress={() => router.push("/customer/cart")}
              />
            </Card>
          ) : null}

          {products.map((product) => (
            <Card key={product.id || product._id} style={{ marginBottom: SPACING.md }}>
              <View style={{ flexDirection: "row", gap: SPACING.md }}>
                <Image source={{ uri: product.imageUrl }} style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: COLORS.border }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: FONT.bold, fontSize: FONT.base }}>{product.name}</Text>
                  <Text style={{ color: COLORS.textSecondary, marginTop: 2 }}>{product.brand} • {product.specs}</Text>
                  <Text style={{ color: COLORS.primary, fontWeight: FONT.bold, marginTop: 4 }}>₱{product.price?.toLocaleString?.() ?? product.price}</Text>
                  <Text style={{ color: COLORS.textSecondary, marginTop: 2 }}>{product.description}</Text>
                  <Button
                    title={product.inStock ? "Add to Cart" : "Out of Stock"}
                    disabled={!product.inStock}
                    style={{ marginTop: SPACING.sm }}
                    onPress={() => handleAddToCart(product)}
                  />
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </CustomerScreen>
  );
}
