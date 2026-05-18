import React, { useCallback, useState } from "react";
import { RefreshControl } from "react-native";
import { Text } from "react-native-paper";
import OrderCard from "../../components/OrderCard";
import Screen from "../../components/Screen";
import { EmptyView, ErrorBanner, LoadingView } from "../../components/StateViews";
import { OrdersApi } from "../../services/api";

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const result = await OrdersApi.mine();
      setOrders(result.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);
  if (loading) return <LoadingView label="Loading orders..." />;
  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <Text variant="headlineSmall">My Orders</Text>
      <ErrorBanner message={error} />
      {orders.length === 0 ? <EmptyView title="No orders yet" message="Your placed POS orders will appear here." /> : null}
      {orders.map((order) => <OrderCard key={order.id || order.orderCode} order={order} />)}
    </Screen>
  );
}
