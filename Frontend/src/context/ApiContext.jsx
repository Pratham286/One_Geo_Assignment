import { createContext} from "react";

export const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
  const url = "http://localhost:3000";

  return (
    <ApiContext.Provider value={{ url }}>
      {children}
    </ApiContext.Provider>
  );
};