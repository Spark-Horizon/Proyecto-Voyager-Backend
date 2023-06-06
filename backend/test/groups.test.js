const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');
const { expect } = chai;
const pool = require('../db/index');

chai.use(chaiHttp);

describe.only('Group API endpoints', function () {
    describe('GET /:id_docente', function () {
        it('should return all groups for the specified teacher id', async function () {
            const res = await chai.request(app).get('/groups/id_docente');
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
        });
    });

    describe('POST /', function () {
        it('should create a group', async function () {
            const res = await chai.request(app).post('/groups').send({
                idMateriaGrupo: 'TC1028',
                visibleGrupo: true,
                user: {
                    id: 'L01732005',
                    name: 'Francisco',
                    lastname1: 'Rocha',
                    lastname2: 'Juárez',
                    role: 'teacher'
                }
            });
            expect(res).to.have.status(201);
            expect(res.body).to.have.property('message', 'Group created succesfully');
        });

        it('should return an error if not all data is present', async function () {
            const res = await chai.request(app).post('/groups').send({});
            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error', 'Entry data not valid');
        });
    });

    describe('DELETE /:id', function () {


        it('should delete the last created group', async function () {
            // First get the last group created
            const query = "SELECT id FROM grupos WHERE id_docente = $1 ORDER BY id DESC LIMIT 1";
            const values = ['L01732005']; // replace with actual teacher id
            const result = await pool.query(query, values);
            const lastGroupId = result.rows[0].id; // the last group's id

            // Now delete it
            const deleteRes = await chai.request(app).delete('/groups/' + lastGroupId);
            expect(deleteRes).to.have.status(200);
            expect(deleteRes.body).to.have.property('message', 'Group deleted successfully');
        });

        it('should return an error if no id is provided', async function () {
            const res = await chai.request(app).delete('/groups');
            expect(res).to.have.status(404);
        });
    });
});

