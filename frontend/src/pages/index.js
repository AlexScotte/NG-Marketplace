import Image from "next/image";
import HomePage from "../assets/Home.png";

const Home = () => {
  return (
    <div className="div-full-screen">
      <Image
        src={HomePage}
        alt="me"
        style={{
          height: "auto",
          width: "100%",
          justifyContent: "center",
        }}
      />
    </div>
  );
};

export default Home;
