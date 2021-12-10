import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { getAddress } from "../scripts/utils/helpers";
import {
  CREATOR_ROLE,
  DEPLOYER_ROLE,
  GOVERNANCE_ROLE,
  GUARDIAN_ROLE,
  PANIC_ROLE,
  STRATEGIST_ROLE,
  VAULT_ROLE,
} from "../scripts/utils/constants";

const deployBase: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const address = getAddress(hre);

  await deploy("Registry", {
    from: deployer,
    args: [deployer, deployer, address.assets.weth],
    log: true,
  });
  const registry = await ethers.getContract("Registry");

  await deploy("TrancheToken", {
    from: deployer,
    log: true,
  });
  const trancheToken = await ethers.getContract("TrancheToken");

  await deploy("AllPairVault", {
    from: deployer,
    args: [registry.address, trancheToken.address],
    log: true,
  });

  const allPair = await ethers.getContract("AllPairVault");

  await registry.grantRole(DEPLOYER_ROLE, deployer);
  await registry.grantRole(CREATOR_ROLE, deployer);
  await registry.grantRole(STRATEGIST_ROLE, deployer);
  await registry.grantRole(PANIC_ROLE, deployer);
  await registry.grantRole(GUARDIAN_ROLE, deployer);
  await registry.grantRole(VAULT_ROLE, allPair.address);
  await registry.grantRole(GOVERNANCE_ROLE, deployer);
};

export default deployBase;
deployBase.tags = ["Base"];
