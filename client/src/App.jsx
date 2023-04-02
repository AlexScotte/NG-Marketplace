import { EthProvider } from "./contexts/EthContext";

function App() {
  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          {/* <Intro />
          <hr />
          <Setup />
          <hr />
          <Demo />
          <hr />
          <Footer /> */}
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
