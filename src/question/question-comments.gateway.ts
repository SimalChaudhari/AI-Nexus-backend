import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const QUESTION_ROOM_PREFIX = 'question:';
const QUESTIONS_LIST_ROOM = 'questions:list';

@WebSocketGateway({
  cors: { origin: '*' },
  path: '/socket.io',
  namespace: '/',
})
export class QuestionCommentsGateway {
  @WebSocketServer()
  server!: Server;

  /**
   * Client sends { questionId } to join the room for that question.
   * All comment events for that question will be emitted to this socket.
   */
  @SubscribeMessage('joinQuestion')
  handleJoinQuestion(client: Socket, payload: { questionId: string }): void {
    if (payload?.questionId) {
      client.join(`${QUESTION_ROOM_PREFIX}${payload.questionId}`);
    }
  }

  /**
   * Client joins the questions list room to receive question:created, question:updated, question:deleted.
   */
  @SubscribeMessage('joinQuestionsList')
  handleJoinQuestionsList(client: Socket): void {
    client.join(QUESTIONS_LIST_ROOM);
  }

  /**
   * Emit to all clients viewing this question. Call from QuestionService.
   */
  emitToQuestion(questionId: string, event: string, data: unknown): void {
    this.server.to(`${QUESTION_ROOM_PREFIX}${questionId}`).emit(event, data);
  }

  /**
   * Emit to all clients viewing the questions list (add/update/delete).
   */
  emitToQuestionsList(event: string, data: unknown): void {
    this.server.to(QUESTIONS_LIST_ROOM).emit(event, data);
  }
}
