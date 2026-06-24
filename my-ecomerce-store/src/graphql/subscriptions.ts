import { gql } from "@apollo/client";

export const ORDER_NOTIFICATION_SUBSCRIPTION = gql`
  subscription OrderNotification($userId: ID!) {
    orderNotification(userId: $userId) {
      title
      message
      type
      orderId
    }
  }
`;

export interface OrderNotificationSubscriptionData {
  orderNotification: {
    title: string;
    message: string;
    type: string;
    orderId: string;
  };
}
