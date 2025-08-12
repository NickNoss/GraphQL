import ReactDOM from "react-dom/client";
import App from "./App.jsx";
// Apollo Client setup
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

//  Create an Apollo Client instance
const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(),
})

// Render the App component wrapped in ApolloProvider
ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
