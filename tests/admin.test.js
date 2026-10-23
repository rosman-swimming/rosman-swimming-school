const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {test}=require('node:test');
const {handler}=require('../netlify/functions/admin-api');
process.env.ADMIN_PASSWORD='local-fixture-only-value';
process.env.GITHUB_WRITE_TOKEN='test-only-do-not-use';
const headers={origin:'https://rosman-swim.netlify.app',host:'rosman-swim.netlify.app'};
function req(action,body,method='POST'){return {httpMethod:method,headers,queryStringParameters:{action},body:body&&JSON.stringify(body)}}
test('wrong credentials rejected',async()=>{const x=await handler(req('login',{username:'gilrosman',password:'wrong'}));assert.equal(x.statusCode,401)});
test('correct credentials give secure cookie',async()=>{const x=await handler(req('login',{username:'gilrosman',password:'local-fixture-only-value'}));assert.equal(x.statusCode,200);assert.match(x.headers['set-cookie'],/HttpOnly; Secure; SameSite=Strict/)});
test('cross origin login rejected',async()=>{const x=await handler({...req('login',{username:'gilrosman',password:'local-fixture-only-value'}),headers:{origin:'https://attacker.example',host:'rosman-swim.netlify.app'}});assert.equal(x.statusCode,403)});
test('unauthorized save rejected',async()=>{const x=await handler(req('save',{data:{privatePrice:999},sha:'fake'}));assert.equal(x.statusCode,401)});
test('anonymous session stays signed out',async()=>{const x=await handler(req('session',null,'GET'));assert.equal(JSON.parse(x.body).authenticated,false)});
