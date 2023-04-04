import { EthProvider } from "./contexts/EthContext";
import Header from "./components/Header";
import Quests from "./pages/Quests";
import Inventory from "./pages/Inventory";
import {
  BrowserRouter as Router,
  HashRouter,
  Route,
  Routes
} from "react-router-dom";
import AuctionHouse from "./pages/AuctionHouse/AuctionHouse";


function App() {
  return (
    <EthProvider>

      {/* <div id="App"> */}
      <HashRouter>
        <Header />
        <Routes>
          <Route path="/quests" element={<Quests />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/auction-house" element={<AuctionHouse />} />
        </Routes>

      </HashRouter>
      {/* </div> */}
    </EthProvider >
  );
}

export default App;
