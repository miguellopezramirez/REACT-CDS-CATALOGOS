import { createBrowserRouter } from "react-router-dom";
import Home from "../catalogos/home/pages/Home";
import Products from "../catalogos/products/pages/Products";
import Prices from "../catalogos/prices/pages/Prices";
import Catalogos from "../catalogos/etiquetasValores/pages/Catalogos";
import Orders from "../catalogos/orders/pages/Orders";
import Payments from "../catalogos/payments/pages/Payments";
import Shippings from "../catalogos/shippings/pages/Shippings";
import Inventories from "../catalogos/inventories/pages/Inventories";
//FIC: Share 
import Error from "../share/errors/pages/Error.js";
const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      errorElement: <Error />,
      children: [
        {
          path: "/products",
          element: <Products />,
        },
        {
            path: "/Catalogos",
            element: <Catalogos />,
        },
        {
          path: "/prices",
          element: <Prices />,
        },
        {
            path: "/orders",
            element: <Orders />,
        },
        {
            path: "/payments",
            element: <Payments />,
        },
        {
            path: "/shippings",
            element: <Shippings />,
        },
        {
            path: "/inventories",
            element: <Inventories />,
        },
      ], 
    },
  ]);
  export default router;