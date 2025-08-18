import { createContext, useContext } from "react";

const HydratedDataContext = createContext({ data: {} });
export const useHydratedData = () => useContext(HydratedDataContext);
export default HydratedDataContext;
