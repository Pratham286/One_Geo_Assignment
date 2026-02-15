import { createContext} from "react";

export const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
  const url = "https://one-geo-assignment.onrender.com";

  return (
    <ApiContext.Provider value={{ url }}>
      {children}
    </ApiContext.Provider>
  );
};