import { createBrowserRouter } from "react-router-dom";
import Home from "../catalogos/home/pages/Home";
import Products from "../catalogos/products/pages/Products";
import Prices from "../catalogos/prices/pages/Prices";
import Catalogos from "../catalogos/etiquetasValores/pages/Catalogos";
import Orders from "../catalogos/orders/pages/Orders";
import Payments from "../catalogos/payments/pages/Payments";
import Shippings from "../catalogos/shippings/pages/Shippings";
import Inventories from "../catalogos/inventories/pages/Inventories";
import Settings from "../catalogos/settings/pages/Settings";
//FIC: Share 
import Error from "../share/errors/pages/Error.js";

const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      errorElement: <Error />,
      children: [
        {
          index: true,
          element: <h2>Home Page - eCommerce Project</h2>,
        },
        {
          path: "products",
          element: <Products />,
        },
        {
            path: "catalogos",
            element: <Catalogos />,
        },
        {
          path: "prices",
          element: <Prices />,
        },
        {
            path: "orders",
            element: <Orders />,
        },
        {
            path: "payments",
            element: <Payments />,
        },
        {
            path: "shippings",
            element: <Shippings />,
        },
        {
            path: "inventories",
            element: <Inventories />,
        },
        {
            path: "settings",
            element: <Settings />,
        },
      ],
    },
  ]);
  export default router;