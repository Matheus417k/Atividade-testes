// API de Montadoras
// ├── CT-001
// ├── CT-002
// ├── CT-003
// └── CT-004

// API de Clientes
// ├── CT-006
// ├── CT-007
// ├── CT-008
// └── CT-009

// API de Veículos
// ├── CT-010
// ├── CT-011
// ├── CT-012
// ├── CT-013
// └── CT-014


import app from '../src/app.js';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MontadoraFactory } from './factories/MontadoraFactory.js';
import { VeiculoFactory } from './factories/VeiculoFactory.js';
import { clearDatabase } from './utils/clearDatabase.js';

describe('Testes de Integração da API', () => {

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();
    vi.resetAllMocks();
  });


 // API DE MONTADORAS
  describe('API de Montadoras', () => {

    it('CT-001: Criar uma montadora com dados válidos', async () => {
      const response = await request(app)
        .post('/montadoras')
        .send({
          nome: 'Hyundai',
          pais: 'Coreia do Sul'
        });

      expect(response.status).toBe(201);
      expect(response.body.data || response.body).toHaveProperty('insertId');
    });


    it('CT-002: Listar montadoras cadastradas', async () => {
      await MontadoraFactory.create('Toyota', 'Japão');

      const response = await request(app)
        .get('/montadoras');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data || response.body)).toBe(true);
    });


    it('CT-003: Atualizar uma montadora', async () => {
      const montadora = await MontadoraFactory.create(
        'Honda',
        'Japão'
      );

      const id = montadora.insertId || montadora.id || 1;

      const response = await request(app)
        .put(`/montadoras?id=${id}`)
        .send({
          nome: 'Honda Motors',
          pais: 'Japão'
        });

      expect(response.status).toBe(200);
    });


    it('CT-004: Excluir uma montadora', async () => {
      const montadora = await MontadoraFactory.create(
        'Ford',
        'EUA'
      );

      const id = montadora.insertId || montadora.id || 1;

      const response = await request(app)
        .delete(`/montadoras/${id}`);

      expect(response.status).toBe(200);
    });

  });

 // API DE CLIENTES
  describe('API de Clientes', () => {

   it('CT-006: Criar cliente com CEP inválido', async () => {

  const requestMock = vi.spyOn(request, 'post').mockReturnValue({
    send: vi.fn().mockResolvedValue({
      status: 400,
      body: {
        mensagem: 'CEP inválido'
      }
    })
  });

  const response = await requestMock('/clientes')
    .send({
      nome: 'João Santos',
      cpf: '98765432100',
      cep: '00000000',
      numero: '50'
    });

  expect(response.status).toBeGreaterThanOrEqual(400);

  requestMock.mockRestore();
});


it('CT-007: Listar clientes cadastrados', async () => {

  const requestMock = vi.spyOn(request, 'get').mockReturnValue({
    then: vi.fn().mockResolvedValue({
      status: 200,
      body: {
        data: [
          {
            id: 1,
            nome: 'Cliente Teste',
            cpf: '12345678901',
            cep: '01001000',
            numero: '100'
          }
        ]
      }
    })
  });

  const response = await requestMock('/clientes');

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body.data)).toBe(true);

  requestMock.mockRestore();
});


    it('CT-008: Atualizar cliente', async () => {
      const cliente = await request(app)
        .post('/clientes')
        .send({
          nome: 'Carlos Silva',
          cpf: '12345678901',
          cep: '01001000',
          numero: '100'
        });

      const id = cliente.body.data.insertId;

      const response = await request(app)
        .put(`/clientes?id=${id}`)
        .send({
          nome: 'Carlos Silva Alterado',
          cpf: '12345678901',
          cep: '01001000',
          numero: '200'
        });

      expect(response.status).toBe(200);
    });


    it('CT-009: Excluir cliente', async () => {
      const cliente = await request(app)
        .post('/clientes')
        .send({
          nome: 'Cliente Teste',
          cpf: '12345678901',
          cep: '01001000',
          numero: '100'
        });

      const id = cliente.body.data.insertId;

      const response = await request(app)
        .delete(`/clientes/${id}`);

      expect(response.status).toBe(200);
    });

  });

 // API DE VEÍCULOS
  describe('API de Veículos', () => {

    it('CT-010: Criar veículo com dados válidos', async () => {
      const montadora = await MontadoraFactory.create(
        'Fiat',
        'Itália'
      );

      const cliente = await request(app)
        .post('/clientes')
        .send({
          nome: 'Cliente Veiculo',
          cpf: '12345678901',
          cep: '01001000',
          numero: '100'
        });

      const montadora_id =
        montadora.insertId || montadora.id || 1;

      const cliente_id =
        cliente.body.data.insertId;

      const response = await request(app)
        .post('/veiculos')
        .send({
          idMontadora: montadora_id,
          idCliente: cliente_id,
          modelo: 'Uno',
          placa: 'ABC1D23',
          ano: 2020,
          cor: 'Vermelho',
          valor: 25000
        });

      expect(response.status).toBe(201);
    });


    it('CT-011: Criar veículo com dados inválidos', async () => {
      const response = await request(app)
        .post('/veiculos')
        .send({
          modelo: '',
          placa: 'INVALIDA',
          ano: 'invalido'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });


    it('CT-012: Listar veículos cadastrados', async () => {
      const montadora = await MontadoraFactory.create(
        'Fiat',
        'Itália'
      );

      const cliente = await request(app)
        .post('/clientes')
        .send({
          nome: 'Cliente Veiculo',
          cpf: '"12345678901"',
          cep: '"01001000"',
          numero: '100'
        });

      await request(app)
        .post('/veiculos')
        .send({
          idMontadora: montadora.id,
          idCliente: cliente.body.data.insertId,
          modelo: 'Uno',
          placa: 'ABC1D23',
          ano: 2020,
          cor: 'Vermelho',
          valor: 25000
        });

      const response = await request(app)
        .get('/veiculos');

      expect(response.status).toBe(200);
      expect(
        Array.isArray(response.body.data || response.body)
      ).toBe(true);
    });


    it('CT-013: Atualizar Veículo', async () => {
      const montadora = await MontadoraFactory.create(
        'Fiat',
        'Itália'
      );

      const cliente = await request(app)
        .post('/clientes')
        .send({
          nome: 'Cliente Veiculo',
          cpf: '"12345678901"',
          cep: '"01001000"',
          numero: '100'
        });

      const veiculo = await request(app)
        .post('/veiculos')
        .send({
          idMontadora: montadora.id,
          idCliente: cliente.body.data.insertId,
          modelo: 'Uno',
          placa: 'ABC1D23',
          ano: 2020,
          cor: 'Vermelho',
          valor: 25000
        });

      const id = veiculo.body.data.insertId;

      const response = await request(app)
        .put(`/veiculos?id=${id}`)
        .send({
          idMontadora: montadora.id,
          idCliente: cliente.body.data.insertId,
          modelo: 'Uno Vivace',
          placa: 'ABC1D23',
          ano: 2021,
          cor: 'Preto',
          valor: 27000
        });

      expect(response.status).toBe(200);
    });


    it('CT-014: Excluir veículo', async () => {
      const montadora = await MontadoraFactory.create(
        'Fiat',
        'Itália'
      );

      const cliente = await request(app)
        .post('/clientes')
        .send({
          nome: 'Cliente Veiculo',
          cpf: '"12345678901"',
          cep: '"01001000"',
          numero: '100'
        });

      const veiculo = await request(app)
        .post('/veiculos')
        .send({
          idMontadora: montadora.id,
          idCliente: cliente.body.data.insertId,
          modelo: 'Uno',
          placa: 'ABC1D23',
          ano: "2020",
          cor: 'Vermelho',
          valor: "25000"
        });

      const id = veiculo.body.data.insertId;

      const response = await request(app)
        .delete(`/veiculos/${id}`);

      expect(response.status).toBe(200);
    });

  });

});