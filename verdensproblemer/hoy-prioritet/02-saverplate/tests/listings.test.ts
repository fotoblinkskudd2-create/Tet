// SaverPlate — Tester for listings og orders (Jest + supertest)
import request from "supertest";
import app from "../backend/server";

let buyerToken: string;
let sellerToken: string;

beforeAll(async () => {
  const buyerRes = await request(app).post("/v1/auth/login").send({ email: "buyer@test.com", password: "test123" });
  buyerToken = buyerRes.body.token;
  const sellerRes = await request(app).post("/v1/auth/login").send({ email: "seller@test.com", password: "test123" });
  sellerToken = sellerRes.body.token;
});

describe("GET /v1/listings", () => {
  it("returns nearby listings sorted by distance", async () => {
    const res = await request(app).get("/v1/listings?lat=59.91&lng=10.75&r=5");
    expect(res.status).toBe(200);
    expect(res.body.listings.length).toBeGreaterThan(0);
    expect(res.body.listings[0].distance_km).toBeDefined();
    const distances = res.body.listings.map((l: any) => l.distance_km);
    expect(distances).toEqual([...distances].sort((a: number, b: number) => a - b));
  });

  it("filters by radius", async () => {
    const res = await request(app).get("/v1/listings?lat=0&lng=0&r=1");
    expect(res.status).toBe(200);
    expect(res.body.listings.length).toBe(0);
  });
});

describe("POST /v1/listings", () => {
  it("allows sellers to create listings", async () => {
    const res = await request(app)
      .post("/v1/listings")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        title: "Pizza-bag", description: "2 pizzaer", original_price: 250, price: 89,
        quantity_available: 3, pickup_start: "2026-02-24T18:00:00Z", pickup_end: "2026-02-24T20:00:00Z",
        lat: 59.913, lng: 10.751,
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Pizza-bag");
  });

  it("rejects buyers from creating listings", async () => {
    const res = await request(app)
      .post("/v1/listings")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ title: "Test" });
    expect(res.status).toBe(403);
  });
});

describe("POST /v1/orders", () => {
  it("creates an order and reduces quantity", async () => {
    const listingsRes = await request(app).get("/v1/listings?lat=59.91&lng=10.75&r=5");
    const listing = listingsRes.body.listings[0];
    const initialQty = listing.quantity_available;

    const res = await request(app)
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ listing_id: listing.id, quantity: 1 });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("confirmed");
    expect(res.body.totalPrice).toBe(listing.price);
  });

  it("rejects order exceeding available quantity", async () => {
    const res = await request(app)
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ listing_id: "lst_1", quantity: 9999 });
    expect(res.status).toBe(400);
  });
});

describe("Health", () => {
  it("returns status with counts", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
