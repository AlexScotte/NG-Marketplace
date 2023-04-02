import { EthProvider } from "./contexts/EthContext";
import Header from "./components/Header";
import Quest from "./pages/Quest";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  BrowserRouter
} from "react-router-dom";


function App() {
  return (
    <EthProvider>

      {/* <div id="App"> */}
      <Router>
        <Header />
        <Routes>

          {/* <Switch> */}
          <Route path="/quest" element={<Quest />} />
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
