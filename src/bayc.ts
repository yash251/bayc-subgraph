import {
  Transfer as TransferEvent,
  BAYC,
} from "../generated/BAYC/BAYC"
import {
  BoredApe,
  Transfer,
  Property
} from "../generated/schema"

import { ipfs, json, JSONValue, log } from '@graphprotocol/graph-ts'

export function handleTransfer(event: TransferEvent): void {

  // handler code for the Transfer entity
  let transfer = new Transfer(event.transaction.hash.concatI32(event.logIndex.toI32()))
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.tokenId = event.params.tokenId
  transfer.blockNumber = event.block.number
  transfer.transactionHash = event.transaction.hash
  transfer.save()
  // The transfer entity handler code ends here

  // handler code for the BoredApe entity
  let contractAddress = BAYC.bind(event.address);

  let boredApe = BoredApe.load(event.params.tokenId.toString());
  if (boredApe == null) {
    boredApe = new BoredApe(event.params.tokenId.toString());
    boredApe.creator = event.params.to;
    boredApe.tokenURI = contractAddress.tokenURI(event.params.tokenId);
  }
  boredApe.newOwner = event.params.to;
  boredApe.blockNumber = event.block.number;
  boredApe.save();
  // The BoredApe entity handler code ends here
}