"use client";
import { redirect, useRouter } from "next/navigation";
import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import Swal from "sweetalert2";
import { io, Socket } from "socket.io-client";
import { IRentalChat, IUserChat, TMessageChat } from "@/interfaces/Ichat";

const ChatWeb: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<TMessageChat[]>([]);
  const [room_id, setRoom_id] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<IUserChat | null>(null);
  const [userStatus, setUserStatus] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rentalsChats, setRentalsChat] = useState<IRentalChat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sender, setSender] = useState<IUserChat | null>(null);
  const [receiver, setReceiver] = useState<IUserChat | null>(null);

  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const userApiUrl = process.env.NEXT_PUBLIC_API_GET_USERS_TOKEN;

  if (!apiUrl || !userApiUrl) {
    throw new Error('Environment variables NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_GET_USERS_TOKEN are not set');
  }

  const fetchUserDetails = async (token: string) => {
    const response = await fetch(`${userApiUrl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching user details");
    }

    const data: IUserChat = await response.json();
    setCurrentUser(data);
  };

  const fetchMessages = async (roomId: string) => {
    const response = await fetch(`${apiUrl}/chat/${roomId}/messages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching messages");
    }

    const data: TMessageChat[] = await response.json();
    const sortedMessages = data.sort(
      (a, b) =>
        new Date(a.date_created || "").getTime() -
        new Date(b.date_created || "").getTime()
    );
    setMessages(sortedMessages);

    if (data.length > 0) {
      setSender(data[0].sender as IUserChat);
      setReceiver(data[0].receiver as IUserChat);
    }
  };

  const fetchRentals = async (token: string) => {
    const response = await fetch(`${apiUrl}/rentals/token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching rentals");
    }

    const data: IRentalChat[] = await response.json();
    setRentalsChat(data);
    if (data.length > 0) {
      setRoom_id(data[0].room_id);
    }
  };

  const handleFetchData = async (token: string) => {
    try {
      setLoading(true);
      await fetchUserDetails(token);
      await fetchRentals(token);
    } catch (error: any) {
      console.error(error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      const parsedSession = JSON.parse(userSession);
      setUserToken(parsedSession.token);
      handleFetchData(parsedSession.token);
    } else {
      setLoading(true);
      Swal.fire({
        title: "Error de acceso",
        text: "Necesitas estar logueado para ingresar",
        icon: "error",
      });
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (room_id && userToken) {
      fetchMessages(room_id);
    }
  }, [room_id, userToken]);

  useEffect(() => {
    if (userToken) {
      const newSocket = io("http://localhost:80/chat", {
        transports: ["websocket"],
        auth: { token: userToken },
      });

      newSocket.on("connect", () => {
        console.log("Conectado");
      });

      newSocket.on("disconnect", () => {
        console.log("Desconectado");
      });

      newSocket.on(room_id, (data: TMessageChat) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [userToken, room_id]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser || !room_id || !receiver) {
      console.error("No se han establecido todos los datos necesarios.");
      return;
    }

    const newMessage: TMessageChat = {
      sender: currentUser,
      receiver: receiver,
      message,
      room_id: room_id,
      date_created: new Date(),
    };

    try {
      const response = await fetch(`${apiUrl}/chat/${room_id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) {
        throw new Error("Error enviando el mensaje");
      }

      const data = await response.json();
      setMessages((prevMessages) => [...prevMessages, data]);

      if (socket) {
        socket.emit("posts", data);
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setError("Error al enviar el mensaje.");
    }

    setMessage("");
  };

  return (
    <div className="bg-gray-400">
      <button onClick={toggleMenu}>
        {menuOpen ? "Cerrar Menú" : "Abrir Menú"}
      </button>
      <form onSubmit={handleSubmit}>
        <input type="text" value={message} onChange={handleChange} />
        <button type="submit">Enviar</button>
      </form>
      <div>
        {loading && <p>Cargando...</p>}
        {error && <p>{error}</p>}
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index}>
              <p>
                {msg.sender?.id !== currentUser?.id ? msg.sender?.name : 'Yo' }: {msg.message ?? 'Mensaje no disponible'}
              </p>
            </div>
          ))
        ) : (
          <p>No hay mensajes</p>
        )}
      </div>
    </div>
  );
};

export default ChatWeb;