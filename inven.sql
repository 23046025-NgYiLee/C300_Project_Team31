CREATE DATABASE  IF NOT EXISTS `inventory_management_thinkclay` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `inventory_management_thinkclay`;
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 8p0w1d.h.filess.io    Database: inventory_management_thinkclay
-- ------------------------------------------------------
-- Server version	8.0.36-28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Accounts`
--

DROP TABLE IF EXISTS `Accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Accounts` (
  `accountID` int NOT NULL AUTO_INCREMENT,
  `accountName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `accountType` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`accountID`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Accounts`
--

LOCK TABLES `Accounts` WRITE;
/*!40000 ALTER TABLE `Accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `Accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Accounts_Reports`
--

DROP TABLE IF EXISTS `Accounts_Reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Accounts_Reports` (
  `reportID` int NOT NULL AUTO_INCREMENT,
  `accountID` int NOT NULL,
  `reportDate` date NOT NULL,
  `reportDetails` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`reportID`),
  KEY `accountID` (`accountID`),
  CONSTRAINT `Accounts_Reports_ibfk_1` FOREIGN KEY (`accountID`) REFERENCES `Accounts` (`accountID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Accounts_Reports`
--

LOCK TABLES `Accounts_Reports` WRITE;
/*!40000 ALTER TABLE `Accounts_Reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `Accounts_Reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Branch`
--

DROP TABLE IF EXISTS `Branch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Branch` (
  `branchID` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`branchID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Branch`
--

LOCK TABLES `Branch` WRITE;
/*!40000 ALTER TABLE `Branch` DISABLE KEYS */;
/*!40000 ALTER TABLE `Branch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Delivery`
--

DROP TABLE IF EXISTS `Delivery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Delivery` (
  `deliveryID` int NOT NULL AUTO_INCREMENT,
  `deliveryDate` date NOT NULL,
  `supplierID` int NOT NULL,
  PRIMARY KEY (`deliveryID`),
  KEY `supplierID_idx` (`supplierID`),
  CONSTRAINT `supplierID` FOREIGN KEY (`supplierID`) REFERENCES `Supplier` (`supplierID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Delivery`
--

LOCK TABLES `Delivery` WRITE;
/*!40000 ALTER TABLE `Delivery` DISABLE KEYS */;
/*!40000 ALTER TABLE `Delivery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Headquarters`
--

DROP TABLE IF EXISTS `Headquarters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Headquarters` (
  `headquartersID` int NOT NULL AUTO_INCREMENT,
  `branchID` int NOT NULL,
  PRIMARY KEY (`headquartersID`),
  KEY `branchID` (`branchID`),
  CONSTRAINT `Headquarters_ibfk_1` FOREIGN KEY (`branchID`) REFERENCES `Branch` (`branchID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Headquarters`
--

LOCK TABLES `Headquarters` WRITE;
/*!40000 ALTER TABLE `Headquarters` DISABLE KEYS */;
/*!40000 ALTER TABLE `Headquarters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Inventory`
--

DROP TABLE IF EXISTS `Inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Inventory` (
  `ItemID` int NOT NULL AUTO_INCREMENT,
  `ItemName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Brand` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ItemClass` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ItemCategory` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ItemType` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Quantity` int DEFAULT '0',
  `UnitPrice` decimal(10,2) DEFAULT NULL,
  `Supplier` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DateAdded` datetime DEFAULT CURRENT_TIMESTAMP,
  `LastUpdated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ItemID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Inventory`
--

LOCK TABLES `Inventory` WRITE;
/*!40000 ALTER TABLE `Inventory` DISABLE KEYS */;
INSERT INTO `Inventory` VALUES (1,'cococrunch','nestel','Food','Cereal','Consumable',16,3.00,'abc','2131-11-22 00:00:00','2131-11-22 00:00:00'),(2,'Product L05','assets','1','food','cc',1,12.00,'ccc','1212-12-12 00:00:00','2025-11-24 13:40:57'),(3,'Product L05','assets',NULL,'assd','as',1,12.00,'ccc','1222-02-12 00:00:00','2222-02-21 00:00:00'),(4,'Trailblazer(star rail)','121',NULL,'asd','asd',121,123.00,'asdsasd','1111-03-12 00:00:00','1232-03-12 00:00:00'),(6,'Product L05','asdada',NULL,'asdasdass','asdasd',12,12321.00,'123','0122-03-12 00:00:00','0123-03-12 00:00:00'),(7,'dasd','assets',NULL,'asd','asd',11,123.00,'asd','0123-03-12 00:00:00','1233-03-12 00:00:00'),(8,'sxss','sad','sad','dsa','2sad',123,123.00,'sad','0232-03-12 00:00:00','3223-02-23 00:00:00'),(9,'sxss','sad','sad','dsa','2sad',123,123.00,'sad','0232-03-12 00:00:00','3223-02-23 00:00:00'),(11,'32112','3ads','sada','sad','sad',21312,123.00,'asd','1312-03-12 00:00:00','1231-03-12 00:00:00'),(12,'ddssfdfd','dsfsdfsfd','fsdfds','test','dfsfdfssfd',1,1.00,'sfdsfdsfd','2025-12-02 00:00:00','2025-12-02 00:00:00');
/*!40000 ALTER TABLE `Inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Inventory_Reports`
--

DROP TABLE IF EXISTS `Inventory_Reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Inventory_Reports` (
  `reportID` int NOT NULL AUTO_INCREMENT,
  `inventoryID` int NOT NULL,
  `reportDate` date NOT NULL,
  `reportDetails` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`reportID`),
  KEY `inventoryID` (`inventoryID`),
  CONSTRAINT `Inventory_Reports_ibfk_1` FOREIGN KEY (`inventoryID`) REFERENCES `Inventory` (`ItemID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Inventory_Reports`
--

LOCK TABLES `Inventory_Reports` WRITE;
/*!40000 ALTER TABLE `Inventory_Reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `Inventory_Reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Order`
--

DROP TABLE IF EXISTS `Order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Order` (
  `orderID` int NOT NULL AUTO_INCREMENT,
  `orderDate` date NOT NULL,
  `headquartersID` int NOT NULL,
  PRIMARY KEY (`orderID`),
  KEY `headquartersID` (`headquartersID`),
  CONSTRAINT `Order_ibfk_1` FOREIGN KEY (`headquartersID`) REFERENCES `Headquarters` (`headquartersID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Order`
--

LOCK TABLES `Order` WRITE;
/*!40000 ALTER TABLE `Order` DISABLE KEYS */;
/*!40000 ALTER TABLE `Order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Order_Detail`
--

DROP TABLE IF EXISTS `Order_Detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Order_Detail` (
  `orderDetailID` int NOT NULL AUTO_INCREMENT,
  `productID` int NOT NULL,
  `orderID` int NOT NULL,
  `productQuantity` int NOT NULL,
  PRIMARY KEY (`orderDetailID`),
  KEY `productID` (`productID`),
  KEY `orderID` (`orderID`),
  CONSTRAINT `Order_Detail_ibfk_1` FOREIGN KEY (`productID`) REFERENCES `Product` (`productID`),
  CONSTRAINT `Order_Detail_ibfk_2` FOREIGN KEY (`orderID`) REFERENCES `Order` (`orderID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Order_Detail`
--

LOCK TABLES `Order_Detail` WRITE;
/*!40000 ALTER TABLE `Order_Detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `Order_Detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Order_Detail_Delivery`
--

DROP TABLE IF EXISTS `Order_Detail_Delivery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Order_Detail_Delivery` (
  `deliveryID` int NOT NULL,
  `orderID` int NOT NULL,
  `orderDetailID` int NOT NULL,
  PRIMARY KEY (`deliveryID`,`orderID`,`orderDetailID`),
  KEY `orderID` (`orderID`),
  KEY `orderDetailID` (`orderDetailID`),
  CONSTRAINT `Order_Detail_Delivery_ibfk_1` FOREIGN KEY (`deliveryID`) REFERENCES `Delivery` (`deliveryID`),
  CONSTRAINT `Order_Detail_Delivery_ibfk_2` FOREIGN KEY (`orderID`) REFERENCES `Order` (`orderID`),
  CONSTRAINT `Order_Detail_Delivery_ibfk_3` FOREIGN KEY (`orderDetailID`) REFERENCES `Order_Detail` (`orderDetailID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Order_Detail_Delivery`
--

LOCK TABLES `Order_Detail_Delivery` WRITE;
/*!40000 ALTER TABLE `Order_Detail_Delivery` DISABLE KEYS */;
/*!40000 ALTER TABLE `Order_Detail_Delivery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Product`
--

DROP TABLE IF EXISTS `Product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Product` (
  `productID` int NOT NULL AUTO_INCREMENT,
  `supplierID` int NOT NULL,
  PRIMARY KEY (`productID`),
  KEY `Product_ibfk_1` (`supplierID`),
  CONSTRAINT `Product_ibfk_1` FOREIGN KEY (`supplierID`) REFERENCES `Supplier` (`supplierID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Product`
--

LOCK TABLES `Product` WRITE;
/*!40000 ALTER TABLE `Product` DISABLE KEYS */;
/*!40000 ALTER TABLE `Product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Product_Reports`
--

DROP TABLE IF EXISTS `Product_Reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Product_Reports` (
  `reportID` int NOT NULL AUTO_INCREMENT,
  `productID` int NOT NULL,
  `reportDate` date NOT NULL,
  `reportDetails` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`reportID`),
  KEY `productID` (`productID`),
  CONSTRAINT `Product_Reports_ibfk_1` FOREIGN KEY (`productID`) REFERENCES `Product` (`productID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Product_Reports`
--

LOCK TABLES `Product_Reports` WRITE;
/*!40000 ALTER TABLE `Product_Reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `Product_Reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Supplier`
--

DROP TABLE IF EXISTS `Supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Supplier` (
  `deliveryID` int NOT NULL,
  `deliveryDate` date NOT NULL,
  `supplierID` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`supplierID`),
  KEY `deliveryID_idx` (`deliveryID`),
  CONSTRAINT `deliveryID` FOREIGN KEY (`deliveryID`) REFERENCES `Delivery` (`deliveryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Supplier`
--

LOCK TABLES `Supplier` WRITE;
/*!40000 ALTER TABLE `Supplier` DISABLE KEYS */;
/*!40000 ALTER TABLE `Supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Transaction_Reports`
--

DROP TABLE IF EXISTS `Transaction_Reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Transaction_Reports` (
  `reportID` int NOT NULL AUTO_INCREMENT,
  `transactionID` int NOT NULL,
  `reportDate` date NOT NULL,
  `reportDetails` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`reportID`),
  KEY `transactionID` (`transactionID`),
  CONSTRAINT `Transaction_Reports_ibfk_1` FOREIGN KEY (`transactionID`) REFERENCES `Transactions` (`transactionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Transaction_Reports`
--

LOCK TABLES `Transaction_Reports` WRITE;
/*!40000 ALTER TABLE `Transaction_Reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `Transaction_Reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Transactions`
--

DROP TABLE IF EXISTS `Transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Transactions` (
  `transactionID` int NOT NULL AUTO_INCREMENT,
  `accountID` int NOT NULL,
  `transactionDate` datetime DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`transactionID`),
  KEY `accountID` (`accountID`),
  CONSTRAINT `Transactions_ibfk_1` FOREIGN KEY (`accountID`) REFERENCES `Accounts` (`accountID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Transactions`
--

LOCK TABLES `Transactions` WRITE;
/*!40000 ALTER TABLE `Transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `Transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `is_admin` tinyint(1) NOT NULL,
  `is_supervisor` tinyint(1) DEFAULT NULL,
  `is_staff` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','email@email','$2b$10$/sE0tbMvJUf6gj7P46oypeiW2J1sh4WqkE2BOZb6JAGHk9CzR.saW',1,NULL,NULL),(2,'staff','staff@staff','$2b$10$jjW5uhJL3pApr.GReknNFeEJE3OUkEHgIi8D0aTVVf/KjsHjuPQQG',0,NULL,1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test@email.com','$2b$10$rnhyUueq.zojKNhH66Fe4eomtmFJBguhfo0DzaxCWn9TUMD7S9oKq'),(2,'23046025@myrp.edu.sg','$2b$10$QNkjsZoH7tN9YNUM0DCve.BTMOvkgKoi.B6tN4rPR6b1VENP6ogZi');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'inventory_management_thinkclay'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-11 13:45:01
