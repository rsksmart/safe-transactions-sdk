import { Safe } from '@gnosis.pm/safe-core-sdk'
import { EMPTY_DATA } from './constants'

export const validateIsDeployedContract = async (
  safe: Safe,
  contractAddress: string
): Promise<void> => {
  const code = await safe.getProvider().getCode(contractAddress)
  if (code === EMPTY_DATA) throw new Error('Contract is not deployed in the current network')
}
