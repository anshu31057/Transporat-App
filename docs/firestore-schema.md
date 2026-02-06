# Firestore Schema (Transport Entry System)

## users
**Document ID:** `uid` (Firebase Auth user id)

Fields:
- `uid` (string) – user id (redundant but helpful for queries)
- `role` (string) – `admin` or `owner`

## entries
**Document ID:** auto-generated

Fields:
- `date` (string) – entry date (YYYY-MM-DD)
- `partyName` (string)
- `vehicleNumber` (string)
- `driverName` (string)
- `from` (string)
- `to` (string)
- `totalAmount` (number)
- `advance` (number)
- `pending` (number)
- `notes` (string, optional)
- `createdBy` (string) – `uid`
- `timestamp` (timestamp) – `serverTimestamp()`

## trucks
**Document ID:** auto-generated

Fields:
- `truckNumber` (string)
- `driverName` (string)
- `driverContact` (string, optional)
- `insuranceStartDate` (string, YYYY-MM-DD)
- `insuranceExpiryDate` (string, YYYY-MM-DD)
- `otherDocuments` (string, optional)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
