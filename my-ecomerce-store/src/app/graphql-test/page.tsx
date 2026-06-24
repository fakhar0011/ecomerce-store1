// "use client";

// import { ApolloProvider, useQuery } from "@apollo/client/react";
// import client from "@/lib/apollo-client";
// import { GET_ORDERS, OrdersData } from "@/graphql/queries";

// function OrdersList() {
//   const { loading, error, data } = useQuery<OrdersData>(GET_ORDERS);

//   if (loading) return <div>Loading orders...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   return (
//     <ul>
//       {data?.orders.map((order) => (
//         <li key={order._id}>
//           Order #{order._id.slice(-6)} – Rs {order.totalAmount} – {order.status}
//         </li>
//       ))}
//     </ul>
//   );
// }

// export default function Page() {
//   return (
//     <ApolloProvider client={client}>
//       <div>
//         <h1>GraphQL Orders Test</h1>
//         <OrdersList />
//       </div>
//     </ApolloProvider>
//   );
// }
