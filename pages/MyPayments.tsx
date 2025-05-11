import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions,
  Clipboard,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../components/General/CustomText';
import { getUserData, refreshUserData } from '../utils/storage';
import { FONTS } from '../styles/typography';
import TopBar from '../components/General/TopBar';

const { width } = Dimensions.get('window');

type PaymentStatus = 'completed' | 'failed' | 'pending' | 'refunded';

interface PaymentDetails {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  vpa?: string;
  created_at: number;
  [key: string]: any;
}

interface Order {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: PaymentStatus;
  paymentId: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  notes: {
    customerPlan: string;
    planDetails: string;
    planTitle: string;
  };
  paymentDetails?: PaymentDetails;
  [key: string]: any;
}

interface UserData {
  orders?: Order[];
  [key: string]: any;
}

const MyPayments = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadUserData = async () => {
    try {
      const data = await refreshUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    loadUserData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, []);

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number } | number) => {
    let date;
    if (typeof timestamp === 'number') {
      date = new Date(timestamp * 1000);
    } else {
      date = new Date(timestamp._seconds * 1000);
    }
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string, divideBy100=false) => {
    const currencySymbol = currency === 'INR' ? '₹' : '$';
    let amt = divideBy100 ? amount / 100 : amount;
    return `${currencySymbol}${(amt).toLocaleString('en-IN')}`;
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    // You could add a toast notification here
  };

  // Parse plan details from stringified JSON
  const parsePlanDetails = (planDetailsString: string) => {
    try {
      return JSON.parse(planDetailsString);
    } catch (error) {
      console.error('Error parsing plan details:', error);
      return null;
    }
  };

  const renderStatusBadge = (status: PaymentStatus) => {
    let color = '';
    let backgroundColor = '';
    let icon = '';

    switch (status) {
      case 'completed':
        color = '#2E7D32';
        backgroundColor = '#E8F5E9';
        icon = 'circle';
        break;
      case 'failed':
        color = '#C62828';
        backgroundColor = '#FFEBEE';
        icon = 'circle';
        break;
      case 'pending':
        color = '#F57C00';
        backgroundColor = '#FFF3E0';
        icon = 'timer-sand';
        break;
      case 'refunded':
        color = '#1565C0';
        backgroundColor = '#E3F2FD';
        icon = 'cash-refund';
        break;
      default:
        color = '#757575';
        backgroundColor = '#F5F5F5';
        icon = 'help-circle';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <MaterialCommunityIcons name={icon} size={14} color={color} />
        <CustomText style={[styles.statusText, { color }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </CustomText>
      </View>
    );
  };

  const toggleExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const renderOrderCard = (order: Order) => {
    const planDetails = parsePlanDetails(order.notes.planDetails);
    const isExpanded = expandedOrder === order.orderId;

    return (
      <View key={order.orderId} style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderTitleContainer}>
            <CustomText style={styles.orderTitle}>
              {order.notes.planTitle || 'Plan Purchase'}
            </CustomText>
            {renderStatusBadge(order.paymentStatus as PaymentStatus)}
          </View>
          <CustomText style={styles.orderDate}>
            {formatDate(order.createdAt)}
          </CustomText>
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.amountContainer}>
            <CustomText style={styles.amountLabel}>Amount</CustomText>
            <CustomText style={styles.amount}>
              {formatAmount(order.amount, order.currency)}
            </CustomText>
          </View>

          <View style={styles.orderIdContainer}>
            <CustomText style={styles.orderIdLabel}>Order ID</CustomText>
            <View style={styles.orderIdWrapper}>
              <CustomText style={styles.orderId} numberOfLines={1}>
                {order.orderId}
              </CustomText>
              <TouchableOpacity
                onPress={() => copyToClipboard(order.orderId)}
                style={styles.copyIcon}
              >
                <Ionicons name="copy-outline" size={16} color="#371981" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentMethod}>
          <MaterialCommunityIcons
            name={
              order.paymentDetails?.method === 'upi'
                ? 'cash'
                : order.paymentDetails?.method === 'card'
                ? 'credit-card'
                : 'wallet'
            }
            size={18}
            color="#371981"
          />
          <CustomText style={styles.paymentMethodText}>
            Paid via {order.paymentDetails?.method?.toUpperCase() || 'Online Payment'}
            {order.paymentDetails?.vpa && ` (${order.paymentDetails.vpa})`}
          </CustomText>
        </View>

        {/* Expand/Collapse Toggle */}
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => toggleExpand(order.orderId)}
        >
          <CustomText style={styles.expandButtonText}>
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </CustomText>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={20}
            color="#371981"
          />
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedDetails}>
            <View style={styles.divider} />

            {/* Plan Details */}
            {planDetails && (
              <>
                <View style={styles.detailRow}>
                  <CustomText style={styles.detailLabel}>Plan Name</CustomText>
                  <CustomText style={styles.detailValue}>
                    {planDetails.plan}
                  </CustomText>
                </View>

                <View style={styles.detailRow}>
                  <CustomText style={styles.detailLabel}>Premium Status</CustomText>
                  <View style={planDetails.isPremium ? styles.premiumBadge : styles.regularBadge}>
                    <CustomText style={planDetails.isPremium ? styles.premiumText : styles.regularText}>
                      {planDetails.isPremium ? 'Premium' : 'Regular'}
                    </CustomText>
                  </View>
                </View>

                
              </>
            )}

            {/* Payment Details */}
            <View style={styles.detailRow}>
              <CustomText style={styles.detailLabel}>Payment ID</CustomText>
              <View style={styles.copyableDetail}>
                <CustomText style={styles.detailValue} numberOfLines={1}>
                  {order.paymentId}
                </CustomText>
                <TouchableOpacity
                  onPress={() => copyToClipboard(order.paymentId)}
                  style={styles.copyIconSmall}
                >
                  <Ionicons name="copy-outline" size={14} color="#371981" />
                </TouchableOpacity>
              </View>
            </View>

            

            {order.paymentDetails?.created_at && (
              <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>Payment Date</CustomText>
                <CustomText style={styles.detailValue}>
                  {formatDate(order.paymentDetails.created_at)}
                </CustomText>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
     <TopBar heading="My Payments" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#371981" />
          </View>
        ) : userData?.orders && userData.orders.length > 0 ? (
          <>
            <CustomText style={styles.sectionTitle}>
              Order History
            </CustomText>
            {userData.orders.map(order => renderOrderCard(order))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={60}
              color="#CCCCCC"
            />
            <CustomText style={styles.emptyTitle}>No Payments Yet</CustomText>
            <CustomText style={styles.emptyText}>
              Your payment history will appear here once you make a purchase.
            </CustomText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyPayments;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: FONTS.BOLD,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: FONTS.BOLD,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: FONTS.REGULAR,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 16,
    fontFamily: FONTS.MEDIUM,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
    fontFamily: FONTS.BOLD,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: FONTS.REGULAR,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    fontFamily: FONTS.MEDIUM,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: FONTS.REGULAR,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#371981',
    fontFamily: FONTS.BOLD,
  },
  orderIdContainer: {
    flex: 1.5,
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: FONTS.REGULAR,
  },
  orderIdWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontFamily: FONTS.REGULAR,
  },
  copyIcon: {
    padding: 4,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentMethodText: {
    fontSize: 13,
    color: '#371981',
    marginLeft: 8,
    fontFamily: FONTS.REGULAR,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  expandButtonText: {
    fontSize: 13,
    color: '#371981',
    marginRight: 4,
    fontFamily: FONTS.MEDIUM,
  },
  expandedDetails: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ECECF6',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    fontFamily: FONTS.REGULAR,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    fontFamily: FONTS.MEDIUM,
  },
  copyableDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  copyIconSmall: {
    padding: 2,
    marginLeft: 4,
  },
  premiumBadge: {
    backgroundColor: '#FFD70020',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumText: {
    color: '#B8860B',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.MEDIUM,
  },
  regularBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  regularText: {
    color: '#757575',
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
  },
});