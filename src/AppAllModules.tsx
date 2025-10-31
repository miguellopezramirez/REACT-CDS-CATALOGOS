import { RouterProvider } from "react-router-dom";
import  CatalogoRouter from "./navigation/NaviRoutesCatalogo";
import Footer from "./share/footer/components/Footer";



export default function AppAllModules() {


    return (
        <>
            <div id='div-app'>
                {/*<h1>Main App - All Modules</h1>*/}
                {/* <ToastContainer /> */}
                <RouterProvider router={CatalogoRouter} />
                {/* <div id='div-footer'>
                    <Footer />
                </div>
                 */}
            </div>
        </> 
    );
}