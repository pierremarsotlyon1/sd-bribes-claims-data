import {
  MultiMerkle,
  Claimed,
  MerkleRootUpdated,
  OwnershipTransferred
} from "../generated/MultiMerkle/MultiMerkle"
import { LastClaimed } from "../generated/schema"
import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export function handleClaimed(event: Claimed): void {

  const tokenAddress = Value.fromAddress(event.params.token).toBytes().toHexString();
  const entity = LastClaimed.load(tokenAddress);

  if (!entity || entity.addresses.indexOf(event.params.account) > -1) {
    return;
  }

  entity.addresses = entity.addresses.concat([event.params.account]);
  entity.save();
}

export function handleMerkleRootUpdated(event: MerkleRootUpdated): void {
  const tokenAddress = event.params.token.toHexString();
  let entity = LastClaimed.load(tokenAddress);
  if (!entity) {
    entity = new LastClaimed(tokenAddress);
    entity.updated = event.params.update.minus(BigInt.fromI64(1));
    entity.addresses = [];
  }
  else {
    const diff = event.params.update.minus(entity.updated);
    if (diff < BigInt.fromI64(2)) {
      return;
    }
    entity.addresses = [];
    entity.updated = event.params.update;
    entity.lastDistribution = event.block.timestamp;
  }

  entity.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void { }
