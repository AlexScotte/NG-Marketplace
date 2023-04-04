import { EthProvider } from "./contexts/EthContext";
import Header from "./components/Header";
import Quests from "./pages/Quests";
import Inventory from "./pages/Inventory";
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";


function App() {
  return (
    <EthProvider>

      {/* <div id="App"> */}
      <Router>
        <Header />
        <Routes>

          {/* <Switch> */}
          <Route path="/quests" element={<Quests />} />
          <Route path="/inventory" element={<Inventory />} />
          {/* <Route path="/users">
              <Users />
              </Route>
              <Route path="/">
              <Home />
            </Route> */}
          {/* </Switch> */}

          {/* <div className="container">
          <hr />
          <hr />
          <Intro />
          <hr />
          <Setup />
          <hr />
          <Demo />
          <hr />
          <Footer />
        </div> */}
        </Routes>
      </Router>
      {/* </div> */}
    </EthProvider >
  );
}

export default App;
