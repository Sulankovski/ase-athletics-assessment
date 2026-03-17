export function toPlayerResponse(row) {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    team: row.team,
    position: row.position,
    jersey_number: row.jersey_number,
    preferred_foot: row.preferred_foot,
    height: row.height,
    weight: row.weight,
    image_url: row.image_url,
  };
}
