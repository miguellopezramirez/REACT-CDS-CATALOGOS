import { useState, useRef } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  SideNavigation,
  SideNavigationItem,
  NavigationLayout,
  ShellBar,
  Button,
  Avatar,
  UserMenu,
  UserMenuItem,
  UserMenuAccount,
} from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

const CommerceAppBar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const userMenuRef = useRef(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSelectionChange = (event) => {
    const selectedKey = event.detail.item.dataset.key;
    switch (selectedKey) {
      case 'home':
        navigate('/');
        break;
      case 'products':
        navigate('/products');
        break;
      case 'prices':
        navigate('/prices');
        break;
      case 'catalogos':
        navigate('/catalogos');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'payments':
        navigate('/payments');
        break;
      case 'shippings':
        navigate('/shippings');
        break;
      case 'inventories':
        navigate('/inventories');
        break;
      default:
        break;
    }
  };

  const handleProfileClick = (e) => {
    userMenuRef.current.showAt(e.detail.targetRef);
    setUserMenuOpen(true);
  };

  return (
    <div
      style={{
        height: '100vh',
        position: 'relative',
      }}
    >
      <NavigationLayout
        header={
          <>
            <ShellBar
              primaryTitle="Aplicación"
              secondaryTitle="Sap React"
              startButton={
                <Button
                  icon="menu"
                  onClick={() => setCollapsed(!collapsed)}
                />
              }
              profile={
                <Avatar>
                  <img
                    alt="Avatar of the current user"
                    src="https://ui5.github.io/webcomponents/images/avatars/woman_avatar_3.png"
                  />
                </Avatar>
              }
              onProfileClick={handleProfileClick}
            />
            <UserMenu
              ref={userMenuRef}
              open={userMenuOpen}
              onClose={() => setUserMenuOpen(false)}
            >
              <UserMenuAccount
                avatarSrc="https://ui5.github.io/webcomponents/images/avatars/woman_avatar_3.png"
                description="Delivery Manager, SAP SE"
                selected
                subtitleText="aliana.chevalier@sap.com"
                titleText="Alaina Chevalier"
              />
              <UserMenuItem
                data-id="setting"
                icon="action-settings"
                text="Setting"
              />
              <UserMenuItem
                data-id="account-action1"
                icon="globe"
                text="Product-specific account action"
              />
              <UserMenuItem icon="official-service" text="Legal Information">
                <UserMenuItem
                  data-id="privacy-policy"
                  icon="private"
                  text="Private Policy"
                />
                <UserMenuItem
                  data-id="terms-of-use"
                  icon="accelerated"
                  text="Terms of Use"
                />
              </UserMenuItem>
            </UserMenu>
          </>
        }
        sideContent={
          <SideNavigation
            collapsed={collapsed}
            onSelectionChange={handleSelectionChange}
          >
            <SideNavigationItem
              text="Home"
              icon="home"
              data-key="home"
            />
            <SideNavigationItem
              text="Productos"
              icon="product"
              data-key="products"
            />
            <SideNavigationItem
              text="Precios"
              icon="product"
              data-key="prices"
            />
            <SideNavigationItem
              text="Catalogos"
              icon="payment-approval"
              data-key="catalogos"
            />
            <SideNavigationItem
              text="Ordenes"
              icon="order-status"
              data-key="orders"
            />
            <SideNavigationItem
              text="Pagos"
              icon="payment-approval"
              data-key="payments"
            />
            <SideNavigationItem
              text="Envios"
              icon="shipping-status"
              data-key="shippings"
            />
            <SideNavigationItem
              text="Inventarios"
              icon="inventory"
              data-key="inventories"
            />
          </SideNavigation>
        }
      >
        <div
          style={{
            padding: '1rem',
          }}
        >
          <Outlet />
        </div>
      </NavigationLayout>
    </div>
  );
};

export default CommerceAppBar;