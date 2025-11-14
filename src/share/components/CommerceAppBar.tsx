import { useState, useRef, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
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
  AvatarDomRef,
} from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

const CommerceAppBar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const avatarRef = useRef<AvatarDomRef>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const location = useLocation(); // Obtén la ubicación (URL) actual
  const [selectedKey, setSelectedKey] = useState('home');

  // Este efecto sincroniza la URL con el ítem seleccionado
  useEffect(() => {
    const path = location.pathname; // Ej: "/catalogos" o "/settings"

    if (path === '/') {
      setSelectedKey('home');
    } else if (path.startsWith('/products')) {
      setSelectedKey('products');
    } else if (path.startsWith('/prices')) {
      setSelectedKey('prices');
    } else if (path.startsWith('/catalogos')) {
      setSelectedKey('catalogos');
    } else if (path.startsWith('/orders')) {
      setSelectedKey('orders');
    } else if (path.startsWith('/payments')) {
      setSelectedKey('payments');
    } else if (path.startsWith('/shippings')) {
      setSelectedKey('shippings');
    } else if (path.startsWith('/inventories')) {
      setSelectedKey('inventories');
    } else {
      // Esta es la parte clave: si estás en "/settings" o cualquier otra ruta,
      // no selecciones nada.
      setSelectedKey('');
    }
  }, [location.pathname]); // Esto se ejecuta cada vez que la URL cambia

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuOpen &&
        avatarRef.current &&
        userMenuRef.current &&
        !avatarRef.current.contains(event.target as Node) &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleSelectionChange = (event: CustomEvent<{ item: HTMLElement }>) => {
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

  const handleProfileClick = () => {
    setUserMenuOpen((prev) => !prev);
  };

  const handleUserMenuItemClick = (event: CustomEvent<{ item: HTMLElement }>) => {
    const selectedId = event.detail.item.dataset.id;

    // Comprueba el data-id del item clickeado
    if (selectedId === 'setting') {
      navigate('/settings'); // Navega a la pagina de configuración
    }
    // Aquí pueden agregar más 'else if' para los otros botones

    // Cierra el menú después de hacer clic
    setUserMenuOpen(false);
  };

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <NavigationLayout
        mode= "Collapsed"
        header={
          <>
            <ShellBar
              primaryTitle="Aplicación"
              secondaryTitle="SAP React"
              startButton={<Button icon="menu" onClick={() => setCollapsed(!collapsed)} />}
              profile={
                <Avatar ref={avatarRef} id="avatar">
                  <img
                    alt="Avatar of the current user"
                    src="https://ui5.github.io/webcomponents/images/avatars/woman_avatar_3.png"
                  />
                </Avatar>
              }
              onProfileClick={handleProfileClick}
            />

            <div ref={userMenuRef}>
              <UserMenu
                opener="avatar"
                open={userMenuOpen}
                onItemClick={handleUserMenuItemClick}
              >
                <UserMenuAccount
                  avatarSrc="https://ui5.github.io/webcomponents/images/avatars/woman_avatar_3.png"
                  description="Delivery Manager, SAP SE"
                  selected
                  subtitleText="aliana.chevalier@sap.com"
                  titleText="Alaina Chevalier"
                />
                <UserMenuItem data-id="setting" icon="action-settings" text="Setting" />
                <UserMenuItem data-id="account-action1" icon="globe" text="Product-specific account action" />
                <UserMenuItem icon="official-service" text="Legal Information">
                  <UserMenuItem data-id="privacy-policy" icon="private" text="Private Policy" />
                  <UserMenuItem data-id="terms-of-use" icon="accelerated" text="Terms of Use" />
                </UserMenuItem>
              </UserMenu>
            </div>
          </>
        }
        sideContent={
          <SideNavigation
            collapsed={collapsed}
            onSelectionChange={handleSelectionChange}
          >
            {/* Añade la propiedad 'selected' a cada ítem para elmanejo adecuado de pantallas */}
            <SideNavigationItem text="Home" icon="home" data-key="home" selected={selectedKey === 'home'} />
            <SideNavigationItem text="Productos" icon="product" data-key="products" selected={selectedKey === 'products'} />
            <SideNavigationItem text="Precios" icon="product" data-key="prices" selected={selectedKey === 'prices'} />
            <SideNavigationItem text="Catalogos" icon="payment-approval" data-key="catalogos" selected={selectedKey === 'catalogos'} />
            <SideNavigationItem text="Ordenes" icon="order-status" data-key="orders" selected={selectedKey === 'orders'} />
            <SideNavigationItem text="Pagos" icon="payment-approval" data-key="payments" selected={selectedKey === 'payments'} />
            <SideNavigationItem text="Envios" icon="shipping-status" data-key="shippings" selected={selectedKey === 'shippings'} />
            <SideNavigationItem text="Inventarios" icon="inventory" data-key="inventories" selected={selectedKey === 'inventories'} />
          </SideNavigation>
        }
      >
        <div style={{ padding: '1rem' }}>
          <Outlet />
        </div>
      </NavigationLayout>
    </div>
  );
};

export default CommerceAppBar;