import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

// Auth Screens
import LoginRegisterScreen from '../screens/auth/LoginRegisterScreen';

// Guest Layout Screens
import HomeScreen from '../screens/HomeScreen';
import CatalogScreen from '../screens/CatalogScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import NewsScreen from '../screens/NewsScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import DeliveryPaymentScreen from '../screens/DeliveryPaymentScreen';
import FAQScreen from '../screens/FAQScreen';
import SupportScreen from '../screens/SupportScreen';
import RateScreen from '../screens/RateScreen';

// App Layout Screens (Authenticated)
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SelfPickupScreen from '../screens/SelfPickupScreen';
import BatchCargoListScreen from '../screens/BatchCargoListScreen';
import BatchCargoDetailsScreen from '../screens/BatchCargoDetailsScreen';
import MultiTerminalScreen from '../screens/MultiTerminalScreen';
import OrderInstructionsScreen from '../screens/OrderInstructionsScreen';

// Admin Layout Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminTicketsScreen from '../screens/admin/AdminTicketsScreen';
import AdminNewsScreen from '../screens/admin/AdminNewsScreen';
import AdminPromocodesScreen from '../screens/admin/AdminPromocodesScreen';
import AdminQuestsScreen from '../screens/admin/AdminQuestsScreen';
import AdminBatchCargosScreen from '../screens/admin/AdminBatchCargosScreen';
import AdminCatalogScreen from '../screens/admin/AdminCatalogScreen';
import AdminStatsScreen from '../screens/admin/AdminStatsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Guest Tabs (для неавторизованных пользователей)
const GuestTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Catalog') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Calculator') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          } else if (route.name === 'News') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'MultiTerminal') {
            iconName = focused ? 'laptop' : 'laptop-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e81e2d',
        tabBarInactiveTintColor: '#808080',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333333',
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Catalog" component={CatalogScreen} />
      <Tab.Screen name="MultiTerminal" component={MultiTerminalScreen} options={{ tabBarLabel: 'Заказать' }} />
      <Tab.Screen name="Calculator" component={CalculatorScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
    </Tab.Navigator>
  );
};

// App Tabs (для авторизованных пользователей)
const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Catalog') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e81e2d',
        tabBarInactiveTintColor: '#808080',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333333',
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Catalog" component={CatalogScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Admin Drawer (для администраторов)
const AdminDrawer = () => {
  return (
    <Drawer.Navigator
          screenOptions={{
            drawerActiveTintColor: '#e81e2d',
            drawerInactiveTintColor: '#cdcdcd',
            drawerStyle: {
              backgroundColor: '#1a1a1a',
            },
            drawerLabelStyle: {
              color: '#ffffff',
            },
            headerShown: false,
          }}
    >
      <Drawer.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="AdminUsers" 
        component={AdminUsersScreen}
        options={{
          drawerLabel: 'Пользователи',
          drawerIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="AdminOrders" 
        component={AdminOrdersScreen}
        options={{
          drawerLabel: 'Заказы',
          drawerIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="AdminProducts" 
        component={AdminProductsScreen}
        options={{
          drawerLabel: 'Товары',
          drawerIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="AdminTickets" 
        component={AdminTicketsScreen}
        options={{
          drawerLabel: 'Тикеты',
          drawerIcon: ({ color, size }) => <Ionicons name="ticket" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="AdminNews" 
        component={AdminNewsScreen}
        options={{
          drawerLabel: 'Новости',
          drawerIcon: ({ color, size }) => <Ionicons name="newspaper" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="AdminPromocodes" 
        component={AdminPromocodesScreen}
        options={{
          drawerLabel: 'Промокоды',
          drawerIcon: ({ color, size }) => <Ionicons name="pricetag" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="AdminQuests" 
        component={AdminQuestsScreen}
        options={{
          drawerLabel: 'Квесты',
          drawerIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="AdminBatchCargos" 
        component={AdminBatchCargosScreen}
        options={{
          drawerLabel: 'Батч-карго',
          drawerIcon: ({ color, size }) => <Ionicons name="car" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="AdminCatalog" 
        component={AdminCatalogScreen}
        options={{
          drawerLabel: 'Каталог',
          drawerIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="AdminStats" 
        component={AdminStatsScreen}
        options={{
          drawerLabel: 'Статистика',
          drawerIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
          <ActivityIndicator size="large" color="#e81e2d" />
        </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          {/* Guest Layout */}
              <Stack.Screen name="GuestTabs" component={GuestTabs} />
              <Stack.Screen 
                name="Login" 
                component={LoginRegisterScreen}
                initialParams={{ mode: 'login' }}
              />
              <Stack.Screen 
                name="Register" 
                component={LoginRegisterScreen}
                initialParams={{ mode: 'register' }}
              />
          
          {/* Guest accessible screens */}
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen}
            options={{ headerShown: true, title: 'Товар' }}
          />
          <Stack.Screen 
            name="Reviews" 
            component={ReviewsScreen}
            options={{ headerShown: true, title: 'Отзывы' }}
          />
          <Stack.Screen 
            name="DeliveryPayment" 
            component={DeliveryPaymentScreen}
            options={{ headerShown: true, title: 'Доставка и оплата' }}
          />
          <Stack.Screen 
            name="FAQ" 
            component={FAQScreen}
            options={{ headerShown: true, title: 'FAQ' }}
          />
          <Stack.Screen 
            name="Support" 
            component={SupportScreen}
            options={{ headerShown: true, title: 'Поддержка' }}
          />
          <Stack.Screen 
            name="Rate" 
            component={RateScreen}
            options={{ headerShown: true, title: 'Курс' }}
          />
          <Stack.Screen 
            name="MultiTerminal" 
            component={MultiTerminalScreen}
            options={{ headerShown: true, title: 'Заказать товар' }}
          />
        </>
      ) : user?.role === 'ADMIN' ? (
        <>
          {/* Admin Layout */}
          <Stack.Screen name="AdminDrawer" component={AdminDrawer} />
          
          {/* Admin detail screens */}
          <Stack.Screen 
            name="OrderDetail" 
            component={OrderDetailScreen}
            options={{ headerShown: true, title: 'Детали заказа' }}
          />
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen}
            options={{ headerShown: true, title: 'Товар' }}
          />
        </>
      ) : (
        <>
          {/* App Layout (Authenticated Users) */}
          <Stack.Screen name="AppTabs" component={AppTabs} />
          
          {/* Authenticated user screens */}
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen}
            options={{ headerShown: true, title: 'Товар' }}
          />
          <Stack.Screen 
            name="Orders" 
            component={OrdersScreen}
            options={{ headerShown: true, title: 'Мои заказы' }}
          />
          <Stack.Screen 
            name="OrderDetail" 
            component={OrderDetailScreen}
            options={{ headerShown: true, title: 'Детали заказа' }}
          />
          <Stack.Screen 
            name="Calculator" 
            component={CalculatorScreen}
            options={{ headerShown: true, title: 'Калькулятор' }}
          />
          <Stack.Screen 
            name="News" 
            component={NewsScreen}
            options={{ headerShown: true, title: 'Новости' }}
          />
          <Stack.Screen 
            name="Support" 
            component={SupportScreen}
            options={{ headerShown: true, title: 'Поддержка' }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ headerShown: true, title: 'Уведомления' }}
          />
          <Stack.Screen 
            name="SelfPickup" 
            component={SelfPickupScreen}
            options={{ headerShown: true, title: 'Самовыкуп' }}
          />
          <Stack.Screen 
            name="BatchCargoList" 
            component={BatchCargoListScreen}
            options={{ headerShown: true, title: 'Сборные грузы' }}
          />
          <Stack.Screen 
            name="BatchCargoDetails" 
            component={BatchCargoDetailsScreen}
            options={{ headerShown: true, title: 'Детали груза' }}
          />
          <Stack.Screen 
            name="MultiTerminal" 
            component={MultiTerminalScreen}
            options={{ headerShown: true, title: 'Заказать товар' }}
          />
          <Stack.Screen 
            name="OrderInstructions" 
            component={OrderInstructionsScreen}
            options={{ headerShown: true, title: 'Инструкции' }}
          />
          <Stack.Screen 
            name="Reviews" 
            component={ReviewsScreen}
            options={{ headerShown: true, title: 'Отзывы' }}
          />
          <Stack.Screen 
            name="DeliveryPayment" 
            component={DeliveryPaymentScreen}
            options={{ headerShown: true, title: 'Доставка и оплата' }}
          />
          <Stack.Screen 
            name="FAQ" 
            component={FAQScreen}
            options={{ headerShown: true, title: 'FAQ' }}
          />
          <Stack.Screen 
            name="Rate" 
            component={RateScreen}
            options={{ headerShown: true, title: 'Курс' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
