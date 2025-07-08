import { RequestHandler } from "express";
import {
  Transaction,
  CreateTransactionRequest,
  SendPaymentResponse,
  TransactionHistory,
} from "@shared/api";

// Mock transaction storage - in production this would be a database
let transactions: Transaction[] = [
  {
    id: "tx_001",
    fromUserId: "user_456",
    toUserId: "user_123",
    fromPeer: "Maya's Maize Stand",
    toPeer: "You",
    amount: 50.0,
    currency: "VT",
    status: "completed",
    type: "received",
    message: "Payment for maize",
    ritual: "harvest blessing",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    networkFee: 0.01,
    signature: "0xabc123...",
  },
  {
    id: "tx_002",
    fromUserId: "user_123",
    toUserId: "user_789",
    fromPeer: "You",
    toPeer: "Kwame (Elder)",
    amount: 25.5,
    currency: "VT",
    status: "completed",
    type: "sent",
    ritual: "elder witness",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    networkFee: 0.01,
    signature: "0xdef456...",
  },
];

const generateTransactionId = (): string => {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const calculateNetworkFee = (amount: number): number => {
  // Simple fee calculation: 0.1% with minimum of 0.01 VT
  return Math.max(amount * 0.001, 0.01);
};

export const sendPayment: RequestHandler = (req, res) => {
  try {
    const request: CreateTransactionRequest = req.body;
    const currentUserId = "user_123"; // In production, get from authentication

    // Validate request
    if (!request.toPeerId || !request.amount || !request.ritual) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: toPeerId, amount, ritual",
      });
    }

    if (request.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    // Check if user has sufficient balance (mock check)
    const currentBalance = 1247.83;
    const networkFee = calculateNetworkFee(request.amount);
    const totalRequired = request.amount + networkFee;

    if (totalRequired > currentBalance) {
      return res.status(400).json({
        success: false,
        error: "Insufficient balance",
      });
    }

    // Create transaction
    const transaction: Transaction = {
      id: generateTransactionId(),
      fromUserId: currentUserId,
      toUserId: request.toPeerId,
      fromPeer: "You",
      toPeer: "Unknown Peer", // In production, lookup peer name
      amount: request.amount,
      currency: "VT",
      status: "pending",
      type: "sent",
      message: request.message,
      ritual: request.ritual,
      timestamp: new Date(),
      networkFee,
      signature: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock signature
    };

    // Store transaction
    transactions.unshift(transaction);

    // Simulate transaction processing
    setTimeout(
      () => {
        transaction.status = "completed";
        transaction.blockHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      },
      3000 + Math.random() * 2000,
    ); // 3-5 seconds

    const response: SendPaymentResponse = {
      transaction,
      estimatedConfirmationTime: 5000, // 5 seconds
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to send payment",
    });
  }
};

export const getTransactionHistory: RequestHandler = (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const type = req.query.type as string;

  let filteredTransactions = [...transactions];

  // Apply filters
  if (status) {
    filteredTransactions = filteredTransactions.filter(
      (tx) => tx.status === status,
    );
  }
  if (type) {
    filteredTransactions = filteredTransactions.filter(
      (tx) => tx.type === type,
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  const response: TransactionHistory = {
    transactions: paginatedTransactions,
    total: filteredTransactions.length,
    page,
    limit,
  };

  res.json({
    success: true,
    data: response,
  });
};

export const getTransaction: RequestHandler = (req, res) => {
  const { transactionId } = req.params;
  const transaction = transactions.find((tx) => tx.id === transactionId);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: "Transaction not found",
    });
  }

  res.json({
    success: true,
    data: transaction,
  });
};

export const cancelTransaction: RequestHandler = (req, res) => {
  const { transactionId } = req.params;
  const transaction = transactions.find((tx) => tx.id === transactionId);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: "Transaction not found",
    });
  }

  if (transaction.status !== "pending") {
    return res.status(400).json({
      success: false,
      error: "Only pending transactions can be cancelled",
    });
  }

  transaction.status = "cancelled";

  res.json({
    success: true,
    data: {
      message: "Transaction cancelled successfully",
      transaction,
    },
  });
};

export const retryTransaction: RequestHandler = (req, res) => {
  const { transactionId } = req.params;
  const transaction = transactions.find((tx) => tx.id === transactionId);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: "Transaction not found",
    });
  }

  if (transaction.status !== "failed") {
    return res.status(400).json({
      success: false,
      error: "Only failed transactions can be retried",
    });
  }

  // Reset transaction status
  transaction.status = "pending";
  transaction.timestamp = new Date();
  transaction.signature = `0x${Math.random().toString(16).substr(2, 64)}`;

  // Simulate retry processing
  setTimeout(() => {
    transaction.status = Math.random() > 0.3 ? "completed" : "failed";
  }, 2000);

  res.json({
    success: true,
    data: {
      message: "Transaction retry initiated",
      transaction,
    },
  });
};
