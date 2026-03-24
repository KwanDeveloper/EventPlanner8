import asyncio
import json

from modules.database import database

def print_result(action: str, result, document_id = None):
    print("=== database.py Result ===\n")
    print(f"Action: {action}\n")
    print(f"Value: {json.dumps(result)}\n")
    print(f"_id: {document_id}\n")
    print("===========================\n")

async def main():
    print("Running examples...\n")

    test_store = database("test_collection")

    first_value, first_id = test_store.set_document("example_key_1", {"name": "Alice", "age": 30, "group": "A"})
    print_result("set_document example_key_1", first_value, first_id)

    second_value, second_id = test_store.set_document("example_key_2", {"name": "Alice", "age": 22, "group": "B"})
    print_result("set_document example_key_2", second_value, second_id)

    found_value_by_key, found_id_by_key = test_store.get_document("example_key_1")
    print_result("get_document by string key", found_value_by_key, found_id_by_key)

    found_value_by_query, found_id_by_query = test_store.get_document({"name": "Alice", "group": "A"})
    print_result("get_document by exact JSON subset query", found_value_by_query, found_id_by_query)

    third_value, third_id = test_store.set_document("example_key_3", {"name": "Bob", "age": 25})
    print_result("set_document example_key_3", third_value, third_id)

    collection_before_delete = test_store.get_collection()
    print_result("get_collection", collection_before_delete)

    removed_bob_value, removed_bob_id = test_store.remove_document({"name": "Bob"})
    print_result("remove_document by exact JSON subset query", removed_bob_value, removed_bob_id)

    collection_after_one_delete = test_store.get_collection()
    print_result("get_collection after single delete", collection_after_one_delete)

    removed_alice_a_value, removed_alice_a_id = test_store.remove_document("example_key_1")
    print_result("remove_document by string key", removed_alice_a_value, removed_alice_a_id)

    removed_alice_b_value, removed_alice_b_id = test_store.remove_document({"name": "Alice", "group": "B"})
    print_result("remove_document by exact JSON subset query", removed_alice_b_value, removed_alice_b_id)

    collection_before_drop = test_store.get_collection()
    print_result("get_collection before collection delete", collection_before_drop)

    removed_collection = test_store.remove_collection()
    print_result("remove_collection", removed_collection)

asyncio.run(main())