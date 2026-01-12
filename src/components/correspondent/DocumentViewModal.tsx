import React from 'react';
import { MerchDocument, OrderData, InvoiceData, StockRecordData, TransportDocumentData, ReturnOfGoodsData, OrderItem, InvoiceItem, ReturnItem } from '@/models';
import { FiX, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';

interface DocumentViewModalProps {
  document: MerchDocument;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewModal: React.FC<DocumentViewModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`${document.type.replace('_', ' ').toUpperCase()} DOCUMENT`, 20, 30);

    doc.setFontSize(12);
    doc.text(`ID: ${document.id}`, 20, 50);
    doc.text(`Status: ${document.status}`, 20, 60);
    doc.text(`Created At: ${new Date(document.createdAt).toLocaleString()}`, 20, 70);
    doc.text(`Updated At: ${new Date(document.updatedAt).toLocaleString()}`, 20, 80);

    let yPos = 100;

    switch (document.type) {
      case 'order':
        const orderData = document.data as OrderData;
        doc.text('Order Details:', 20, yPos);
        yPos += 10;
        doc.text(`Customer: ${orderData.customerName}`, 20, yPos);
        yPos += 10;
        doc.text(`Email: ${orderData.customerEmail}`, 20, yPos);
        yPos += 10;
        if (orderData.customerPhone) {
          doc.text(`Phone: ${orderData.customerPhone}`, 20, yPos);
          yPos += 10;
        }
        doc.text(`Shipping Address: ${orderData.shippingAddress}`, 20, yPos);
        yPos += 10;
        doc.text('Items:', 20, yPos);
        yPos += 10;
        orderData.items.forEach((item: OrderItem) => {
          doc.text(`${item.merchName} - Qty: ${item.quantity} - Price: KSh ${item.price} - Subtotal: KSh ${item.subtotal}`, 30, yPos);
          yPos += 10;
        });
        doc.text(`Total: KSh ${orderData.total}`, 20, yPos);
        if (orderData.notes) {
          yPos += 10;
          doc.text(`Notes: ${orderData.notes}`, 20, yPos);
        }
        break;

      case 'invoice':
        const invoiceData = document.data as InvoiceData;
        doc.text('Invoice Details:', 20, yPos);
        yPos += 10;
        doc.text(`Order ID: ${invoiceData.orderId}`, 20, yPos);
        yPos += 10;
        doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 20, yPos);
        yPos += 10;
        doc.text(`Payment Status: ${invoiceData.paymentStatus}`, 20, yPos);
        yPos += 10;
        doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, 20, yPos);
        yPos += 10;
        doc.text('Items:', 20, yPos);
        yPos += 10;
        invoiceData.items.forEach((item: InvoiceItem) => {
          doc.text(`${item.description} - Qty: ${item.quantity} - Price: KSh ${item.price} - Subtotal: KSh ${item.subtotal}`, 30, yPos);
          yPos += 10;
        });
        doc.text('Items:', 20, yPos);
        yPos += 10;
        invoiceData.items.forEach((item: InvoiceItem) => {
          doc.text(`${item.description} - Qty: ${item.quantity} - Price: KSh ${item.price} - Subtotal: KSh ${item.subtotal}`, 30, yPos);
          yPos += 10;
        });
        doc.text(`Total: KSh ${invoiceData.total}`, 20, yPos);
        if (invoiceData.tax) {
          yPos += 10;
          doc.text(`Tax: KSh ${invoiceData.tax}`, 20, yPos);
        }
        if (invoiceData.discount) {
          yPos += 10;
          doc.text(`Discount: KSh ${invoiceData.discount}`, 20, yPos);
        }
        break;

      case 'transport_document':
        const transportData = document.data as TransportDocumentData;
        doc.text('Transport Document Details:', 20, yPos);
        yPos += 10;
        doc.text(`Order ID: ${transportData.orderId}`, 20, yPos);
        yPos += 10;
        doc.text(`Carrier: ${transportData.carrier}`, 20, yPos);
        yPos += 10;
        doc.text(`Tracking Number: ${transportData.trackingNumber}`, 20, yPos);
        yPos += 10;
        doc.text(`Shipped At: ${new Date(transportData.shippedAt).toLocaleString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Estimated Delivery: ${new Date(transportData.estimatedDelivery).toLocaleString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Status: ${transportData.status}`, 20, yPos);
        break;

      case 'return_of_goods':
        const returnData = document.data as ReturnOfGoodsData;
        doc.text('Return of Goods Details:', 20, yPos);
        yPos += 10;
        doc.text(`Order ID: ${returnData.orderId}`, 20, yPos);
        yPos += 10;
        doc.text(`Reason: ${returnData.reason}`, 20, yPos);
        yPos += 10;
        doc.text(`Return Date: ${new Date(returnData.returnDate).toLocaleDateString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Status: ${returnData.status}`, 20, yPos);
        if (returnData.refundAmount) {
          yPos += 10;
          doc.text(`Refund Amount: KSh ${returnData.refundAmount}`, 20, yPos);
        }
        doc.text('Items:', 20, yPos);
        yPos += 10;
        returnData.items.forEach((item: ReturnItem) => {
          doc.text(`${item.merchName} - Qty: ${item.quantity} - Condition: ${item.condition}`, 30, yPos);
          yPos += 10;
        });
        break;

      case 'stock_record':
        const stockData = document.data as StockRecordData;
        doc.text('Stock Record Details:', 20, yPos);
        yPos += 10;
        doc.text(`Merchandise: ${stockData.merchName}`, 20, yPos);
        yPos += 10;
        doc.text(`Type: ${stockData.type}`, 20, yPos);
        yPos += 10;
        doc.text(`Quantity: ${stockData.quantity}`, 20, yPos);
        yPos += 10;
        doc.text(`Reason: ${stockData.reason}`, 20, yPos);
        if (stockData.reference) {
          yPos += 10;
          doc.text(`Reference: ${stockData.reference}`, 20, yPos);
        }
        break;

      case 'transport_document':
        const pdfTransportData = document.data as TransportDocumentData;
        doc.text('Transport Document Details:', 20, yPos);
        yPos += 10;
        doc.text(`Order ID: ${pdfTransportData.orderId}`, 20, yPos);
        yPos += 10;
        doc.text(`Carrier: ${pdfTransportData.carrier}`, 20, yPos);
        yPos += 10;
        doc.text(`Tracking Number: ${pdfTransportData.trackingNumber}`, 20, yPos);
        yPos += 10;
        doc.text(`Shipped At: ${new Date(pdfTransportData.shippedAt).toLocaleString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Estimated Delivery: ${new Date(pdfTransportData.estimatedDelivery).toLocaleString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Status: ${pdfTransportData.status}`, 20, yPos);
        break;

      case 'return_of_goods':
        const pdfReturnData = document.data as ReturnOfGoodsData;
        doc.text('Return of Goods Details:', 20, yPos);
        yPos += 10;
        doc.text(`Order ID: ${pdfReturnData.orderId}`, 20, yPos);
        yPos += 10;
        doc.text(`Reason: ${pdfReturnData.reason}`, 20, yPos);
        yPos += 10;
        doc.text(`Return Date: ${new Date(pdfReturnData.returnDate).toLocaleDateString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Status: ${pdfReturnData.status}`, 20, yPos);
        if (pdfReturnData.refundAmount) {
          yPos += 10;
          doc.text(`Refund Amount: KSh ${pdfReturnData.refundAmount}`, 20, yPos);
        }
        doc.text('Items:', 20, yPos);
        yPos += 10;
        pdfReturnData.items.forEach((item: ReturnItem) => {
          doc.text(`${item.merchName} - Qty: ${item.quantity} - Condition: ${item.condition}`, 30, yPos);
          yPos += 10;
        });
        break;
    }

    doc.save(`${document.type}_${document.id}.pdf`);
  };

  const renderDocument = () => {
    switch (document.type) {
      case 'order':
        const orderData = document.data as OrderData;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{orderData.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Email</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{orderData.customerEmail}</p>
              </div>
              {orderData.customerPhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Phone</label>
                  <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{orderData.customerPhone}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Address</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 whitespace-pre-wrap">{orderData.shippingAddress}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Order Items</h3>
              <div className="space-y-2">
                {orderData.items.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div>
                      <p className="font-medium">{item.merchName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity} | Price: KSh {item.price}</p>
                    </div>
                    <p className="font-medium">KSh {item.subtotal}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <strong>Total: KSh {orderData.total}</strong>
              </div>
            </div>

            {orderData.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 whitespace-pre-wrap">{orderData.notes}</p>
              </div>
            )}
          </div>
        );

      case 'invoice':
        const invoiceData = document.data as InvoiceData;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{invoiceData.orderId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Number</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{invoiceData.invoiceNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{invoiceData.paymentStatus}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{new Date(invoiceData.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Invoice Items</h3>
              <div className="space-y-2">
                {invoiceData.items.map((item: InvoiceItem, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity} | Price: KSh {item.price}</p>
                    </div>
                    <p className="font-medium">KSh {item.subtotal}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <strong>Tax: KSh {invoiceData.tax || 0}</strong>
                </div>
                <div>
                  <strong>Discount: KSh {invoiceData.discount || 0}</strong>
                </div>
                <div className="text-right">
                  <strong>Total: KSh {invoiceData.total}</strong>
                </div>
              </div>
            </div>
          </div>
        );

      case 'stock_record':
        const stockData = document.data as StockRecordData;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Merchandise</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{stockData.merchName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{stockData.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{stockData.quantity}</p>
              </div>
              {stockData.reference && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reference</label>
                  <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{stockData.reference}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
              <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 whitespace-pre-wrap">{stockData.reason}</p>
            </div>
          </div>
        );

      case 'transport_document':
        const transportData = document.data as TransportDocumentData;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{transportData.orderId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Carrier</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{transportData.carrier}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Number</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{transportData.trackingNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{transportData.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipped At</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{new Date(transportData.shippedAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Delivery</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{new Date(transportData.estimatedDelivery).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      case 'return_of_goods':
        const returnData = document.data as ReturnOfGoodsData;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{returnData.orderId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Return Date</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{new Date(returnData.returnDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{returnData.status}</p>
              </div>
              {returnData.refundAmount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Refund Amount</label>
                  <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">KSh {returnData.refundAmount}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Return Items</h3>
              <div className="space-y-2">
                {returnData.items.map((item: ReturnItem, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div>
                      <p className="font-medium">{item.merchName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity} | Condition: {item.condition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
              <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 whitespace-pre-wrap">{returnData.reason}</p>
            </div>
          </div>
        );

      default:
        return <div>Document view not implemented for {document.type}</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            View {document.type.replace('_', ' ')}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={generatePDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <FiDownload className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300">ID</label>
              <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{document.id}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300">Status</label>
              <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{document.status}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300">Created At</label>
              <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">{new Date(document.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {renderDocument()}
      </div>
    </div>
  );
};