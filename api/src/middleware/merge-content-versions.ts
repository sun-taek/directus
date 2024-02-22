import type { RequestHandler } from 'express';
import { VersionsService } from '../services/versions.js';
import asyncHandler from '../utils/async-handler.js';
import { mergeVersionsRaw, mergeVersionSaves } from '../utils/merge-version-saves.js';

/**
 * Checks and merges
 */
export const mergeContentVersions: RequestHandler = asyncHandler(async (req, res, next) => {
	if (
		req.sanitizedQuery.version &&
		req.collection &&
		(req.singleton || req.params['pk']) &&
		'data' in res.locals['payload']
	) {
		const versionsService = new VersionsService({ accountability: req.accountability ?? null, schema: req.schema });

		const versionData = await versionsService.getVersionSaves(
			req.sanitizedQuery.version,
			req.collection,
			req.params['pk'],
		);

		if (!versionData) return next();

		const originalData = res.locals['payload'].data;

		if (req.sanitizedQuery.versionRaw) {
			res.locals['payload'].data = mergeVersionsRaw(originalData, versionData);
		} else {
			res.locals['payload'].data = mergeVersionSaves(originalData, versionData, req.collection, req.schema);
		}
	}

	return next();
});
