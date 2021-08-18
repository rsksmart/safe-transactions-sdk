import { AddressZero } from '@ethersproject/constants'
import EthersSafe, { ContractNetworksConfig, EthersAdapter } from '@gnosis.pm/safe-core-sdk'
import { BigNumber, BigNumberish, Contract, Signer } from 'ethers'
import { deployments, ethers } from 'hardhat'

export const getDeploymentAddress = async (name: string): Promise<string> => {
  const deployment = await deployments.get(name)
  return deployment.address
}

export const getSafeMasterCopyAddress = async (): Promise<string> => {
  return getDeploymentAddress('GnosisSafe')
}

export const getSafeProxyFactoryAddress = async (): Promise<string> => {
  return getDeploymentAddress('GnosisSafeProxyFactory')
}

export const getMultiSendAddress = async (): Promise<string> => {
  return getDeploymentAddress('MultiSend')
}

export const getSafeSingleton = async (): Promise<Contract> => {
  const safeMasterCopyAddress = await getSafeMasterCopyAddress()
  const Safe = await ethers.getContractFactory('GnosisSafe')
  return Safe.attach(safeMasterCopyAddress)
}

export const getFactory = async (): Promise<Contract> => {
  const safeProxyFactoryAddress = await getSafeProxyFactoryAddress()
  const Factory = await ethers.getContractFactory('GnosisSafeProxyFactory')
  return Factory.attach(safeProxyFactoryAddress)
}

export const getSafeTemplate = async (): Promise<Contract> => {
  const singleton = await getSafeSingleton()
  const factory = await getFactory()
  const template = await factory.callStatic.createProxy(singleton.address, '0x')
  await factory.createProxy(singleton.address, '0x').then((tx: any) => tx.wait())
  const Safe = await ethers.getContractFactory('GnosisSafe')
  return Safe.attach(template)
}

export const getSafeWithOwners = async (
  owners: string[],
  threshold?: number,
  callbackHandler: string = AddressZero
): Promise<Contract> => {
  const template = await getSafeTemplate()
  await template.setup(
    owners,
    threshold || owners.length,
    AddressZero,
    '0x',
    callbackHandler,
    AddressZero,
    0,
    AddressZero
  )
  return template
}

export const balanceVerifierFactory =
  (getBalance: (address: string) => Promise<BigNumber>) => async (address: string) => {
    const balanceBefore = await getBalance(address)
    return async (expected: BigNumberish): Promise<boolean> => {
      const balanceAfter = await getBalance(address)
      const diff = balanceAfter.sub(balanceBefore)
      return diff.eq(expected)
    }
  }

export const getDefaultCallbackHandler = async (): Promise<Contract> => {
  const DefaultCallbackDeployment = await deployments.get('DefaultCallbackHandler')
  const DefaultCallbackFactory = await ethers.getContractFactory('DefaultCallbackHandler')
  return DefaultCallbackFactory.attach(DefaultCallbackDeployment.address)
}

export const createEthersSafe = async (
  signer: Signer,
  safeAddress: string
): Promise<EthersSafe> => {
  const ethAdapterOwner1 = new EthersAdapter({
    ethers,
    signer
  })
  const chainId = await ethAdapterOwner1.getChainId()
  const safeMasterCopyAddress = await getSafeMasterCopyAddress()
  const safeProxyFactoryAddress = await getSafeProxyFactoryAddress()
  const multiSendAddress = await getMultiSendAddress()
  const networkConfiguration: ContractNetworksConfig = {
    [chainId]: {
      safeMasterCopyAddress,
      safeProxyFactoryAddress,
      multiSendAddress
    }
  }
  const ethersSafe = await EthersSafe.create({
    ethAdapter: ethAdapterOwner1,
    safeAddress,
    contractNetworks: networkConfiguration
  })
  return ethersSafe
}
