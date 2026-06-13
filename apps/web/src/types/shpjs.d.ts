declare module "shpjs" {
  export default function shp(
    input: ArrayBuffer,
  ): Promise<GeoJSON.FeatureCollection | GeoJSON.FeatureCollection[]>;
}
