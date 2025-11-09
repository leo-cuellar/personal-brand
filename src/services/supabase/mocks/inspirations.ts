import { randomUUID } from "crypto";
import { Inspiration } from "../schemas";
import { MOCK_PERSON_ID } from "./persons";

export const mockInspirations: Inspiration[] = [
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        text: "Hablar sobre cómo la tecnología está cambiando la forma en que trabajamos y vivimos",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        text: "Después de 10 años en la industria tech, he aprendido que el éxito no viene de saber todas las respuestas, sino de hacer las preguntas correctas. La curiosidad es el superpoder que más subestimamos. Cuando dejamos de preguntar '¿por qué?' y '¿qué pasaría si?', dejamos de crecer. Hoy quiero compartir contigo las 3 preguntas que cambiaron mi carrera y cómo pueden cambiar la tuya también. ¿Cuál es la pregunta que más te ha impactado? 👇",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        text: "Escribir sobre la importancia de construir una marca personal en LinkedIn",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        text: "El error más grande que cometí al empezar mi carrera fue pensar que tenía que saberlo todo antes de empezar. La realidad es que el 80% del aprendizaje viene de hacer, no de estudiar. Si estás esperando el momento perfecto para lanzar tu proyecto, crear contenido o cambiar de carrera, déjame decirte algo: ese momento nunca llegará. El momento perfecto es ahora, con todas tus dudas e imperfecciones. ¿Qué estás esperando para empezar?",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        text: "Compartir una historia sobre cómo superé el síndrome del impostor",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        text: "Hace 5 años, me sentía como un fraude. Cada vez que lograba algo, pensaba que era suerte. Cada vez que alguien me felicitaba, esperaba que descubrieran que no sabía tanto como parecía. El síndrome del impostor me tenía paralizado. Pero un día, un mentor me dijo algo que cambió todo: 'Si sientes que eres un impostor, significa que estás creciendo más rápido de lo que tu mente puede procesar.' Esa perspectiva me liberó. Ahora, cuando siento que soy un impostor, sé que estoy en el lugar correcto, desafiándome a mí mismo. ¿Has sentido esto alguna vez?",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

