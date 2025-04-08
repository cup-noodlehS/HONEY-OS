import { useRouter } from "next/router";

import { useEffect } from "react";

import styled from "styled-components";



const NotFoundContainer = styled.div`

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  height: 100vh;

  background-color: #000;

  color: #fff;

  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;

`;



const Title = styled.h1`

  font-size: 3rem;

  margin-bottom: 1rem;

`;



const Subtitle = styled.p`

  font-size: 1.5rem;

  margin-bottom: 2rem;

`;



const Button = styled.button`

  background-color: #4caf50;

  color: white;

  border: none;

  border-radius: 4px;

  padding: 10px 20px;

  font-size: 1rem;

  cursor: pointer;

  transition: background-color 0.3s;



  &:hover {

    background-color: #45a049;

  }

`;



const Custom404 = (): React.ReactElement => {

    const router = useRouter();



    useEffect(() => {

        const timer = setTimeout(() => {

            router.push("/");

        }, 5000);



        return () => clearTimeout(timer);

    }, [router]);



    return (

        <NotFoundContainer>

            <Title>404 - Page Not Found</Title>

            <Subtitle>The page you are looking for doesn't exist.</Subtitle>

            <Button onClick={() => router.push("/")}>Go Home</Button>

        </NotFoundContainer>

    );

};



export default Custom404;
