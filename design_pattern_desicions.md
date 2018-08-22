# Ownable
- Any contract which inherits Ownable will have owner set to the caller at the time of its creation, and any of its functions implementing onlyOwner modifier will not accept calls from another account. Note that the creator can be a user or another contract.

# Destructible
- Base contract that can be destroyed by owner. All funds in contract will be sent to the owner.