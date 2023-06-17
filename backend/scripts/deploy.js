async function main() {
  const deployer = require("./deployer");
  await deployer.deploy();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
