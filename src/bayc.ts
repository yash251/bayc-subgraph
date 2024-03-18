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

  // handler code for the metadata
  const ipfshash = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq"
  let tokenURI = "/" + event.params.tokenId.toString();

  let property = Property.load(event.params.tokenId.toString());

  if (property == null) {
    property = new Property(event.params.tokenId.toString());

    let fullURI = ipfshash + tokenURI;
    log.debug('The fullURI is: {} ', [fullURI]);

    let ipfsData = ipfs.cat(fullURI);

    if (ipfsData) {
      let ipfsValues = json.fromBytes(ipfsData).toObject();

      if (ipfsValues) {
        let image = ipfsValues.get('image');
        let attributes = ipfsValues.get('attributes');

        let attributeArray: JSONValue[];
        if (image) {
          property.image = image.toString();
        }
        if (attributes) {

          attributeArray = attributes.toArray();

          for (let i = 0; i < attributeArray.length; i++) {

            let attributeObject = attributeArray[i].toObject();

            let trait_type = attributeObject.get('trait_type');
            let value_type = attributeObject.get('value');

            let trait: string;
            let value: string;

            if (trait_type && value_type) {

              trait = trait_type.toString();
              value = value_type.toString();

              if (trait && value) {

                if (trait == "Background") {
                  property.background = value;
                }

                if (trait == "Clothes") {
                  property.clothes = value;
                }

                if (trait == "Earring") {
                  property.earring = value;
                }

                if (trait == "Eyes") {
                  property.eyes = value;
                }

                if (trait == "Fur") {
                  property.fur = value;
                }

                if (trait == "Hat") {
                  property.hat = value;
                }

                if (trait == "Mouth") {
                  property.mouth = value;
                }

              }

            }

          }

        }

      }
    }

  }

  property.save();
  // The Metadata entity handler code ends here
}