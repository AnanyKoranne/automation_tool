import axios from "axios";
import https from "https";
import querystring from "querystring";
import dotenv from "dotenv";

dotenv.config();

const HUBSPOT_HOST = "api.hubapi.com";
const API_KEY = process.env.HUBSPOT_API_KEY;
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

function buildPath(path: string, qs?: Record<string, string>) {
  let full = path;
  if (API_KEY && !ACCESS_TOKEN) {
    const q = Object.assign({}, qs || {}, { hapikey: API_KEY });
    full = `${path}?${querystring.stringify(q)}`;
  } else if (qs && Object.keys(qs).length) {
    full = `${path}?${querystring.stringify(qs)}`;
  }
  return full;
}

function request(method: string, path: string, body?: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (payload) headers["Content-Length"] = Buffer.byteLength(payload).toString();
    if (ACCESS_TOKEN) headers["Authorization"] = `Bearer ${ACCESS_TOKEN}`;

    const options = {
      hostname: HUBSPOT_HOST,
      path,
      method,
      headers,
    } as any;

    const req = https.request(options, (res) => {
      const chunks: any[] = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        let parsed: any = raw;
        try {
          parsed = raw ? JSON.parse(raw) : undefined;
        } catch (e) {
          // leave as raw string
        }
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: parsed });
        } else {
          const err: any = new Error(`HubSpot API error ${res.statusCode}: ${JSON.stringify(parsed)}`);
          err.status = res.statusCode;
          err.body = parsed;
          reject(err);
        }
      });
    });

    req.on("error", (err) => reject(err));

    if (payload) req.write(payload);
    req.end();
  });
}

export async function searchContactByEmail(email: string) {
  if (!email) return null;
  const path = buildPath(`/crm/v3/objects/contacts/search`);
  const body = {
    filterGroups: [
      {
        filters: [
          { propertyName: "email", operator: "EQ", value: email },
        ],
      },
    ],
    properties: ["email", "firstname", "lastname", "phone"],
    limit: 1,
  };

  const res = await request("POST", path, body);
  const results = res.body?.results || [];
  return results.length ? results[0] : null;
}

export async function createContact(properties: Record<string, any>) {
  const path = buildPath(`/crm/v3/objects/contacts`);
  const body = { properties };
  const res = await request("POST", path, body);
  return res.body;
}

export async function updateContact(id: string, properties: Record<string, any>) {
  if (!id) throw new Error("Contact id is required for update");
  const path = buildPath(`/crm/v3/objects/contacts/${encodeURIComponent(id)}`);
  const body = { properties };
  const res = await request("PATCH", path, body);
  return res.body;
}

export async function upsertContact(contact: { email: string; firstname?: string; lastname?: string; phone?: string; [k: string]: any }) {
  if (!API_KEY && !ACCESS_TOKEN) throw new Error("HUBSPOT_API_KEY or HUBSPOT_ACCESS_TOKEN must be set in env");
  if (!contact || !contact.email) throw new Error("Contact email is required for upsert");

  const existing = await searchContactByEmail(contact.email);

  const properties: Record<string, any> = {};
  if (contact.firstname) properties.firstname = contact.firstname;
  if (contact.lastname) properties.lastname = contact.lastname;
  if (contact.phone) properties.phone = contact.phone;
  // copy any other provided properties except email which HubSpot uses as identifier
  for (const k of Object.keys(contact)) {
    if (!["email", "firstname", "lastname", "phone"].includes(k)) {
      properties[k] = contact[k];
    }
  }
  properties.email = contact.email;

  if (existing) {
    const id = existing.id || (existing.properties && existing.properties.hs_object_id);
    if (!id) {
      return createContact(properties);
    }
    return updateContact(id.toString(), properties);
  } else {
    return createContact(properties);
  }
}

export default {
  searchContactByEmail,
  createContact,
  updateContact,
  upsertContact,
};
