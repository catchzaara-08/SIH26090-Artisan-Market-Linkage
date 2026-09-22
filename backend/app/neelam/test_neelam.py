from hash_chain import create_event


# First event
event_1 = create_event(
    event_id="EVT-001",
    product_id="TN-ART-001",
    event_type="PRODUCT_CREATED",
    event_data={
        "name": "Handmade Terracotta Pot",
        "material": "Clay",
        "region": "Tamil Nadu"
    },
    previous_hash="000000"
)

print("EVENT 1")
print(event_1)
print()


# Second event
event_2 = create_event(
    event_id="EVT-002",
    product_id="TN-ART-001",
    event_type="PRICE_CREATED",
    event_data={
        "price": 850
    },
    previous_hash=event_1["event_hash"]
)

print("EVENT 2")
print(event_2)