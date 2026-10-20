/**
 * Fixtures DataSource: the whole store from JSON in this folder (SPEC §5.1).
 * Built from OzLED's public catalogue by scripts/fixtures. Validated on load,
 * so a bad fixture fails the build rather than rendering a broken page.
 */
import { z } from "zod";
import * as S from "../schema";
import { createMemorySource } from "../memory";

import productsRaw from "./products.json";
import categoriesRaw from "./categories.json";
import hubsRaw from "./hubs.json";
import kitsRaw from "./kits.json";
import bannersRaw from "./banners.json";
import postsRaw from "./posts.json";
import contentRaw from "./content.json";
import redirectsRaw from "./redirects.json";

const products = z.array(S.Product).parse(productsRaw);
const categories = z.array(S.Category).parse(categoriesRaw);
const hubs = z.array(S.ApplicationHub).parse(hubsRaw);
const kits = z.array(S.Kit).parse(kitsRaw);
const banners = z.array(S.Banner).parse(bannersRaw);
const posts = z.array(S.BlogPost).parse(postsRaw);
const content = z.array(S.ContentPage).parse(contentRaw);
const redirects = z.array(S.Redirect).parse(redirectsRaw);

export const fixtures = createMemorySource({ products, categories, hubs, kits, banners, posts, content, redirects });
